import { Image } from 'react-native'

/**
 * Skia/ONNX 관련 모듈을 lazy-require하여 앱 시작 시 네이티브 모듈 크래시를 방지한다.
 * 실제 호출 시점에만 네이티브 모듈이 로드된다.
 */
export async function predictCoverTextColor(
    imageUrl: string,
    districtName: string
): Promise<string> {
    try {
        const { Skia, AlphaType, ColorType } = require('@shopify/react-native-skia') as typeof import('@shopify/react-native-skia')
        const FileSystem = require('expo-file-system/legacy') as typeof import('expo-file-system/legacy')
        const { preprocessToROI } = require('./preprocess') as typeof import('./preprocess')
        const { predictTitleColor } = require('./inference') as typeof import('./inference')

        const getImageSize = (uri: string): Promise<{ width: number; height: number }> =>
            new Promise((resolve, reject) =>
                Image.getSize(uri, (w, h) => resolve({ width: w, height: h }), reject)
            )

        console.log(`[coverColorHelper] 추론 시작 | district=${districtName} | imageUrl=${imageUrl}`)
        const { width, height } = await getImageSize(imageUrl)
        console.log(`[coverColorHelper] 이미지 크기: ${width}x${height}`)

        const roiUri = await preprocessToROI(imageUrl, width, height)
        console.log(`[coverColorHelper] ROI 추출 완료: ${roiUri}`)

        const base64 = await FileSystem.readAsStringAsync(roiUri, {
            encoding: FileSystem.EncodingType.Base64,
        })
        const data = Skia.Data.fromBase64(base64)
        const img = Skia.Image.MakeImageFromEncoded(data)
        if (!img) throw new Error('ROI 이미지 디코딩 실패')

        const pixels = img.readPixels(0, 0, {
            width: 136,
            height: 36,
            colorType: ColorType.RGBA_8888,
            alphaType: AlphaType.Unpremul,
        })
        if (!pixels) throw new Error('픽셀 읽기 실패')

        const t0 = Date.now()
        const result = await predictTitleColor({
            roiPixelsRGBA: pixels as Uint8Array,
            titleMaskOptions: {
                text: districtName,
                fontFamily: 'Freesentation',
                fontSize: 28,
                textAlign: 'left',
                card: { width: 150, height: 200, left: 0, top: 60 }, // top=30% of 200, TITLE_ROI.y=56
            },
        })
        console.log(
            `[coverColorHelper] ✅ 추론 성공 | ${Date.now() - t0}ms | top1=${result.top1Index} | hex=${result.color.hex} | name=${result.color.name} | district=${districtName}`
        )

        return result.color.hex
    } catch (e) {
        console.warn('[coverColorHelper] ❌ AI 색상 추론 실패, #FFFFFF 폴백:', e)
        return '#FFFFFF'
    }
}
