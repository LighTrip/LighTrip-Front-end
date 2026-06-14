/**
 * Student_FP16_PTQ_top1.onnx 추론 유틸
 *
 * - onnxruntime-react-native 사용
 * - input: 'input', shape [1,4,36,136], float32, NCHW, channel order R,G,B,mask
 * - output: 'top1_index', shape [1], int64, range 0~31 (palette.json id)
 */

import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import paletteData from './palette.json';
import { MODEL_INPUT_SHAPE, buildRGBTensor, buildTitleMask, buildModelInput, TitleMaskOptions } from './preprocess';

// ---------------------------------------------------------------------------
// 모델 파일 경로 확보 (asset -> 파일시스템 복사)
// ---------------------------------------------------------------------------

let modelPathPromise: Promise<string> | null = null;

/**
 * 번들된 onnx 파일을 디바이스 파일시스템으로 복사하고 절대경로를 반환한다.
 * InferenceSession.create()는 파일시스템 경로를 요구하므로 필요.
 * cover_ai/Student_FP16_PTQ_top1.onnx 가 같은 폴더에 있어야 한다.
 */
export function getModelPath(): Promise<string> {
  modelPathPromise ??= (async () => {
    const asset = Asset.fromModule(require('./Student_FP16_PTQ_top1.onnx'));
    await asset.downloadAsync();

    const dest = `${FileSystem.documentDirectory}Student_FP16_PTQ_top1.onnx`;
    const info = await FileSystem.getInfoAsync(dest);
    if (!info.exists) {
      await FileSystem.copyAsync({ from: asset.localUri!, to: dest });
    }

    return dest;
  })();
  return modelPathPromise;
}

// ---------------------------------------------------------------------------
// Palette 타입 & 매핑
// ---------------------------------------------------------------------------

export interface PaletteColor {
  id: number;
  hex: string;
  name: string;
  group: string;
  rgb: [number, number, number];
  lab: [number, number, number];
  relative_luminance: number;
  aesthetic_prior: number;
}

const palette = paletteData as PaletteColor[];

/**
 * top1_index (0~31) -> palette.json 항목으로 매핑
 */
export function getColorFromIndex(index: number): PaletteColor {
  const entry = palette.find((p) => p.id === index);
  if (!entry) {
    throw new Error(`getColorFromIndex: no palette entry for id=${index}`);
  }
  return entry;
}

// ---------------------------------------------------------------------------
// 모델 세션 관리
// ---------------------------------------------------------------------------

let sessionPromise: Promise<InferenceSession> | null = null;

/**
 * ONNX 모델 세션을 lazy 하게 생성하고 캐시한다.
 * modelPath는 앱에 bundle된 모델 파일의 실제 경로/URI로 교체할 것.
 */
export function getSession(modelPath: string): Promise<InferenceSession> {
  sessionPromise ??= InferenceSession.create(modelPath);
  return sessionPromise;
}

// ---------------------------------------------------------------------------
// 추론 실행
// ---------------------------------------------------------------------------

export interface InferenceResult {
  /** 0~31 */
  top1Index: number;
  /** palette.json에서 매핑된 컬러 정보 */
  color: PaletteColor;
}

/**
 * 전처리 완료된 입력 텐서(Float32Array, length 18496)를 받아 추론을 실행하고
 * top1_index와 그에 대응하는 palette 색상을 반환한다.
 */
export async function runInference(
  modelPath: string,
  inputData: Float32Array
): Promise<InferenceResult> {
  const expectedLen = (MODEL_INPUT_SHAPE as readonly number[]).reduce((a, b) => a * b, 1); // 1*4*36*136
  if (inputData.length !== expectedLen) {
    throw new Error(
      `runInference: inputData length mismatch. expected=${expectedLen}, actual=${inputData.length}`
    );
  }

  const session = await getSession(modelPath);

  const tensor = new Tensor('float32', inputData, [...MODEL_INPUT_SHAPE]);

  const results = await session.run({ input: tensor });

  const outputTensor = results['top1_index'];
  if (!outputTensor) {
    throw new Error("runInference: output 'top1_index' not found in results");
  }

  // int64 -> number (onnxruntime이 BigInt로 반환할 수 있음)
  const raw = outputTensor.data[0];
  const top1Index = Number(raw);

  return {
    top1Index,
    color: getColorFromIndex(top1Index),
  };
}

// ---------------------------------------------------------------------------
// End-to-end 헬퍼
// ---------------------------------------------------------------------------

export interface PredictTitleColorParams {
  /** 생략 시 getModelPath()로 자동 로드 */
  modelPath?: string;
  /** title ROI(136x36)의 RGBA 픽셀 버퍼 */
  roiPixelsRGBA: Uint8Array;
  /** 타이틀 마스크 생성 옵션 (앱 실제 렌더링 설정과 동일해야 함) */
  titleMaskOptions: TitleMaskOptions;
}

/**
 * ROI 픽셀 데이터와 타이틀 마스크 옵션으로부터 모델 입력을 구성하고
 * 추론까지 한 번에 수행하는 end-to-end 헬퍼.
 */
export async function predictTitleColor(params: PredictTitleColorParams): Promise<InferenceResult> {
  const { roiPixelsRGBA, titleMaskOptions } = params;
  const modelPath = params.modelPath ?? (await getModelPath());

  const rgbTensor = buildRGBTensor(roiPixelsRGBA);
  const maskTensor = await buildTitleMask(titleMaskOptions);
  const inputTensor = buildModelInput(rgbTensor, maskTensor);

  return runInference(modelPath, inputTensor);
}