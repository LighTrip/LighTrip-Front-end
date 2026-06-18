/**
 * Student_FP16_PTQ_top1.onnx 온디바이스 전처리 유틸
 *
 * 파이프라인:
 *  원본 이미지
 *   -> cover resize (150x200 비율 유지)
 *   -> 150x200 center crop
 *   -> title ROI crop (x=7, y=36, w=136, h=36)
 *   -> RGB tensor [1,3,36,136] (0~1 정규화, /255.0)
 *   -> title mask tensor [1,1,36,136] (앱 실제 타이틀 렌더링과 동일 폰트/위치/정렬로 생성)
 *   -> concat -> [1,4,36,136] (R, G, B, mask)
 *
 * NOTE:
 *  - mean/std 정규화 없음. RGB는 단순 /255.0
 *  - title mask는 학습 데이터 생성 시 사용한 폰트/사이즈/정렬/위치 로직과
 *    반드시 1:1 동일해야 함. 아래 buildTitleMask의 파라미터들을 앱 실제
 *    타이틀 렌더링 설정과 맞춰서 수정할 것.
 */

import * as ImageManipulator from 'expo-image-manipulator';
import { Skia, AlphaType, ColorType, SkTypeface } from '@shopify/react-native-skia';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

// ---------------------------------------------------------------------------
// 0. 폰트 로딩 (Freesentation)
// ---------------------------------------------------------------------------

// assets/fonts/Freesentation-4Regular.ttf
// 이 파일(preprocess.ts) 기준 상대경로는 프로젝트 구조에 맞게 조정할 것.
let freesentationTypefacePromise: Promise<SkTypeface | null> | null = null;

/**
 * Freesentation-4Regular.ttf를 로드해 SkTypeface로 반환한다 (캐시됨).
 * 로드 실패 시 null을 반환하며, 이 경우 Skia.Font(undefined, ...)로 폴백한다.
 */
export function getFreesentationTypeface(): Promise<SkTypeface | null> {
  freesentationTypefacePromise ??= (async () => {
    try {
      const asset = Asset.fromModule(require('../../../../assets/fonts/Freesentation-4Regular.ttf'));
      await asset.downloadAsync();

      const uri = asset.localUri ?? asset.uri;
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const data = Skia.Data.fromBase64(base64);
      const typeface = Skia.Typeface.MakeFreeTypeFaceFromData(data);
      return typeface;
    } catch (e) {
      console.warn('getFreesentationTypeface: failed to load font, falling back to default', e);
      return null;
    }
  })();
  return freesentationTypefacePromise;
}

// ---------------------------------------------------------------------------
// 1. Cover resize + center crop 좌표 계산
// ---------------------------------------------------------------------------

export interface CoverCropParams {
  resizeW: number;
  resizeH: number;
  cropX: number;
  cropY: number;
  cropW: number;
  cropH: number;
}

/**
 * 원본 이미지를 비율 유지한 채 target 크기를 "cover" 하도록 resize한 뒤
 * center crop 좌표를 계산한다.
 */
export function coverResizeAndCrop(
  srcW: number,
  srcH: number,
  targetW = 150,
  targetH = 200
): CoverCropParams {
  const targetRatio = targetW / targetH; // 0.75
  const srcRatio = srcW / srcH;

  let resizeW: number;
  let resizeH: number;

  if (srcRatio > targetRatio) {
    // 원본이 target보다 가로로 길다 -> height를 맞추고 width를 늘림
    resizeH = targetH;
    resizeW = Math.round(srcW * (targetH / srcH));
  } else {
    // 원본이 target보다 세로로 길다 (또는 동일 비율) -> width를 맞추고 height를 늘림
    resizeW = targetW;
    resizeH = Math.round(srcH * (targetW / srcW));
  }

  const cropX = Math.floor((resizeW - targetW) / 2);
  const cropY = Math.floor((resizeH - targetH) / 2);

  return { resizeW, resizeH, cropX, cropY, cropW: targetW, cropH: targetH };
}

// Title ROI는 150x200 기준 고정 좌표
export const TITLE_ROI = { x: 7, y: 48, width: 136, height: 36 } as const;

/**
 * 원본 이미지 -> 150x200 center crop -> title ROI(136x36) crop까지 수행하고
 * 결과 이미지 uri를 반환한다.
 */
export async function preprocessToROI(
  uri: string,
  srcW: number,
  srcH: number
): Promise<string> {
  const { resizeW, resizeH, cropX, cropY } = coverResizeAndCrop(srcW, srcH, 150, 200);

  const result = await ImageManipulator.manipulateAsync(
    uri,
    [
      { resize: { width: resizeW, height: resizeH } },
      { crop: { originX: cropX, originY: cropY, width: 150, height: 200 } },
      {
        crop: {
          originX: TITLE_ROI.x,
          originY: TITLE_ROI.y,
          width: TITLE_ROI.width,
          height: TITLE_ROI.height,
        },
      },
    ],
    { format: ImageManipulator.SaveFormat.PNG }
  );

  return result.uri; // 136x36 PNG (title ROI)
}

// ---------------------------------------------------------------------------
// 2. RGB tensor 생성 [1,3,36,136]
// ---------------------------------------------------------------------------

const ROI_W = TITLE_ROI.width; // 136
const ROI_H = TITLE_ROI.height; // 36
const ROI_PLANE = ROI_W * ROI_H; // 4896

/**
 * RGBA Uint8Array(136x36, row-major)를 받아 CHW Float32 RGB 텐서로 변환한다.
 * 각 채널 값은 /255.0 로 0~1 정규화.
 *
 * pixels.length 는 ROI_W * ROI_H * 4 여야 한다.
 */
export function buildRGBTensor(pixels: Uint8Array, w = ROI_W, h = ROI_H): Float32Array {
  if (pixels.length !== w * h * 4) {
    throw new Error(
      `buildRGBTensor: pixel buffer length mismatch. expected=${w * h * 4}, actual=${pixels.length}`
    );
  }

  const plane = w * h;
  const tensor = new Float32Array(3 * plane); // [R-plane, G-plane, B-plane]

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pi = (y * w + x) * 4; // RGBA index
      const idx = y * w + x; // CHW spatial index

      tensor[0 * plane + idx] = pixels[pi] / 255; // R
      tensor[1 * plane + idx] = pixels[pi + 1] / 255; // G
      tensor[2 * plane + idx] = pixels[pi + 2] / 255; // B
    }
  }

  return tensor; // length = 3 * 36 * 136 = 14688
}

// ---------------------------------------------------------------------------
// 3. Title text mask 생성 [1,1,36,136]
// ---------------------------------------------------------------------------

export interface TitleMaskOptions {
  /** ROI 내부에 렌더링될 타이틀 텍스트 (예: 장소 이름) */
  text: string;
  /** 앱에서 실제 사용하는 폰트 패밀리 (Skia Typeface와 동일해야 함). 예: 'Freesentation' */
  fontFamily?: string;
  /**
   * 앱에서 실제 사용하는 폰트 사이즈 (px).
   * 카드(150x200) 기준 fontSize. (현재 LighTrip placeName: fontSize 28)
   */
  fontSize: number;
  /** 앱에서 실제 사용하는 가로 정렬. LighTrip placeName은 별도 지정 없음 -> 'left' */
  textAlign?: 'left' | 'center' | 'right';

  /**
   * 텍스트 위치를 "카드(150x200) 기준 절대 좌표"로 지정한다.
   * RN의 position: 'absolute' 스타일 값을 그대로 변환해서 넣으면 된다.
   * 예: top: '30%' -> cardTop = 200 * 0.30 = 60
   *
   * left/right/cardTop은 카드(150x200) 좌표계 기준이며,
   * 내부에서 ROI(x=7,y=36,w=136,h=36) 좌표계로 자동 변환된다.
   */
  card?: {
    /** 카드 width (기본 150) */
    width?: number;
    /** 카드 height (기본 200) */
    height?: number;
    /** RN style의 left (px). textAlign='left'일 때 사용, 기본 0 */
    left?: number;
    /** RN style의 right (px). textAlign='right'일 때 사용, 기본 0 */
    right?: number;
    /** RN style의 top (px). 카드 기준 텍스트 박스의 top 좌표 */
    top: number;
  };

  /**
   * 베이스라인 보정 비율. Skia drawText의 y는 baseline 기준이고
   * RN Text의 top은 텍스트 박스 top-left 기준이므로,
   * baseline = card.top - ROI.y + fontSize * baselineRatio 로 보정한다.
   * 폰트의 ascent 비율에 따라 0.75~0.85 사이로 튜닝 필요. 기본 0.8
   */
  baselineRatio?: number;
  /** alpha threshold (0~255). 이 값 이상이면 mask=1.0 */
  alphaThreshold?: number;
}

/**
 * 학습 데이터 생성 시 사용한 폰트/사이즈/정렬/위치 로직과 동일한 방식으로
 * 136x36 캔버스(ROI)에 타이틀 텍스트를 렌더링하고, 텍스트가 차지하는 영역을
 * 1.0, 배경을 0.0으로 하는 binary mask(Float32Array, 길이 36*136)를 반환한다.
 *
 * !! 중요 !!
 * - fontFamily / fontSize / textAlign / card 좌표 / baselineRatio 값은
 *   반드시 앱의 실제 타이틀 렌더링 설정 및 학습 데이터 생성 스크립트와
 *   1:1 일치해야 한다. 다르면 모델 추론 품질이 저하된다.
 * - Freesentation-4Regular.ttf를 자동으로 로드하여 사용한다 (getFreesentationTypeface).
 *   로드 실패 시 시스템 기본 폰트로 폴백한다.
 * - 비동기 함수이므로 await로 호출해야 한다.
 *
 * LighTrip placeName 스타일 기준 사용 예:
 *   passportCover: 150 x 200 (cover 기준)
 *   placeName: { position: 'absolute', top: '30%', fontSize: 28, fontFamily: 'Freesentation' }
 *   -> top: '30%' of 200 = 60
 *
 *   await buildTitleMask({
 *     text: place.name,
 *     fontFamily: 'Freesentation',
 *     fontSize: 28,
 *     textAlign: 'left',
 *     card: { width: 150, height: 200, left: 0, top: 60 },
 *   });
 */
export async function buildTitleMask(
  options: TitleMaskOptions,
  w = ROI_W,
  h = ROI_H
): Promise<Float32Array> {
  const {
    text,
    fontSize,
    textAlign = 'left',
    card,
    baselineRatio = 0.8,
    alphaThreshold = 0,
  } = options;

  const cardWidth = card?.width ?? 150;
  const cardLeft = card?.left ?? 0;
  const cardRight = card?.right ?? 0;
  const cardTop = card?.top ?? 0;

  const surface = Skia.Surface.MakeOffscreen(w, h);
  if (!surface) {
    throw new Error('buildTitleMask: failed to create offscreen Skia surface');
  }

  const canvas = surface.getCanvas();
  canvas.clear(Skia.Color('transparent'));

  // Freesentation 폰트 로드 (실패 시 시스템 기본 폰트로 폴백)
  const typeface = await getFreesentationTypeface();
  const font = Skia.Font(typeface ?? undefined, fontSize);
  const paint = Skia.Paint();
  paint.setColor(Skia.Color('white'));
  paint.setAntiAlias(true);

  const textWidth = font.getTextWidth(text);

  // ---- 카드(cardWidth x cardHeight) 기준 텍스트 x 좌표 계산 ----
  let xCard: number;
  if (textAlign === 'center') {
    xCard = (cardWidth - textWidth) / 2;
  } else if (textAlign === 'right') {
    xCard = cardWidth - textWidth - cardRight;
  } else {
    xCard = cardLeft;
  }

  // ---- 카드 좌표 -> ROI(x=TITLE_ROI.x, y=TITLE_ROI.y) 좌표로 변환 ----
  const x = xCard - TITLE_ROI.x;
  const yTopInROI = cardTop - TITLE_ROI.y;
  const y = yTopInROI + fontSize * baselineRatio; // baseline 보정

  canvas.drawText(text, x, y, paint, font);

  const image = surface.makeImageSnapshot();
  const pixels = image.readPixels(0, 0, {
    width: w,
    height: h,
    colorType: ColorType.RGBA_8888,
    alphaType: AlphaType.Unpremul,
  }) as Uint8Array | null;

  if (!pixels) {
    throw new Error('buildTitleMask: failed to read pixels from Skia surface');
  }

  const mask = new Float32Array(w * h);
  let nonZero = 0;
  for (let i = 0; i < w * h; i++) {
    const alpha = pixels[i * 4 + 3];
    mask[i] = alpha > alphaThreshold ? 1 : 0;
    if (mask[i]) nonZero++;
  }
  return mask; // length = 36 * 136 = 4896
}

// ---------------------------------------------------------------------------
// 4. 최종 입력 tensor 생성 [1,4,36,136]
// ---------------------------------------------------------------------------

const MODEL_INPUT_LEN = 4 * ROI_H * ROI_W; // 4 * 36 * 136 = 18496

/**
 * RGB 텐서(3*36*136)와 mask 텐서(1*36*136)를 concat하여
 * 모델 입력 [1,4,36,136] (R, G, B, mask 순서)을 생성한다.
 */
export function buildModelInput(rgbTensor: Float32Array, maskTensor: Float32Array): Float32Array {
  if (rgbTensor.length !== 3 * ROI_PLANE) {
    throw new Error(
      `buildModelInput: rgbTensor length mismatch. expected=${3 * ROI_PLANE}, actual=${rgbTensor.length}`
    );
  }
  if (maskTensor.length !== ROI_PLANE) {
    throw new Error(
      `buildModelInput: maskTensor length mismatch. expected=${ROI_PLANE}, actual=${maskTensor.length}`
    );
  }

  const final = new Float32Array(MODEL_INPUT_LEN);
  final.set(rgbTensor, 0);
  final.set(maskTensor, 3 * ROI_PLANE);
  return final; // length = 18496
}

export const MODEL_INPUT_SHAPE = [1, 4, ROI_H, ROI_W] as const; // [1, 4, 36, 136]