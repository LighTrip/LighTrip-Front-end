import * as ImageManipulator from "expo-image-manipulator";
import { Image } from "react-native";

// 화면에 실제로 그려지는 크기는 커야 수백 px 인데 원본은 3~4천 px 이라 그대로 올리면
// 한 장에 3MB 가 넘는다. 긴 변을 이 값으로 맞추면 눈에 띄는 화질 저하 없이 10배 가까이 줄어든다.
const MAX_DIMENSION = 1600;
const COMPRESS_QUALITY = 0.8;

const getImageSize = (uri: string) =>
    new Promise<{ width: number; height: number }>((resolve, reject) => {
        Image.getSize(
            uri,
            (width, height) => resolve({ width, height }),
            reject,
        );
    });

/**
 * 업로드 전에 사진을 줄이고 JPEG 로 다시 인코딩한다.
 * 실패하면 원본 uri 를 그대로 돌려주므로 업로드 자체가 막히지는 않는다.
 */
export const compressImageForUpload = async (uri: string): Promise<string> => {
    try {
        let actions: ImageManipulator.Action[] = [];

        try {
            const { width, height } = await getImageSize(uri);

            // 가로/세로 중 긴 쪽을 기준으로 줄여야 비율이 유지된다.
            if (Math.max(width, height) > MAX_DIMENSION) {
                actions = [
                    width >= height
                        ? { resize: { width: MAX_DIMENSION } }
                        : { resize: { height: MAX_DIMENSION } },
                ];
            }
        } catch (error) {
            // 크기를 못 읽으면 리사이즈는 건너뛰고 재인코딩만 한다.
            console.log("이미지 크기 조회 실패:", error);
        }

        const result = await ImageManipulator.manipulateAsync(uri, actions, {
            compress: COMPRESS_QUALITY,
            format: ImageManipulator.SaveFormat.JPEG,
        });

        return result.uri;
    } catch (error) {
        console.log("이미지 압축 실패, 원본을 그대로 업로드합니다:", error);
        return uri;
    }
};

export const compressImagesForUpload = (uris: string[]) =>
    Promise.all(uris.map((uri) => compressImageForUpload(uri)));
