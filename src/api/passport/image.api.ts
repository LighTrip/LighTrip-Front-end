import axiosInstance from '@/src/api/axiosInstance'
import { API_ENDPOINTS } from '@/src/api/config'
import * as FileSystem from 'expo-file-system/legacy'

// 이미지 presigned URL 발급
export const getPresignedUrl = (contentType: string) =>
    axiosInstance.post(API_ENDPOINTS.IMAGE.PRESIGNED_URL, {
        domain: 'passport',
        contentType,
    })


const getMimeType = (uri: string): string => {
    if (uri.endsWith('.webp')) return 'image/webp'
    if (uri.endsWith('.png')) return 'image/png'
    return 'image/jpeg'
}

// S3 업로드 — FileSystem.uploadAsync가 네이티브 레이어에서 파일을 읽어 PUT으로 전송 (iOS/Android 모두 동작)
export const uploadToS3 = async (presignedUrl: string, imageUri: string): Promise<void> => {
    const mimeType = getMimeType(imageUri)
    const result = await FileSystem.uploadAsync(presignedUrl, imageUri, {
        httpMethod: 'PUT',
        headers: { 'Content-Type': mimeType },
    })
    if (result.status < 200 || result.status >= 300) {
        throw new Error(`S3 upload failed: ${result.status}`)
    }
}