import axiosInstance from '@/src/api/axiosInstance'
import { API_ENDPOINTS } from '@/src/api/config'

// 이미지 presigned URL 발급
export const getPresignedUrl = (contentType: string) =>
    axiosInstance.post(API_ENDPOINTS.IMAGE.PRESIGNED_URL, {
        domain: 'passport',
        contentType,
    })


// S3 업로드
export const uploadToS3 = async (presignedUrl: string, imageUri: string) => {
    const response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        body: {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'upload.jpg',
        } as any,
    })
    console.log('S3 응답 status:', response.status)
}