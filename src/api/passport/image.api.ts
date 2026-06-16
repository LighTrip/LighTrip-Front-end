import axiosInstance from '@/src/api/axiosInstance'
import { API_ENDPOINTS } from '@/src/api/config'

// 이미지 presigned URL 발급
export const getPresignedUrl = (contentType: string) =>
    axiosInstance.post(API_ENDPOINTS.IMAGE.PRESIGNED_URL, {
        domain: 'passport',
        contentType,
    })


// S3 업로드
// Android에서 content:// URI를 fetch body로 직접 쓰면 "Network request failed"가 남.
// XMLHttpRequest는 React Native 레이어에서 content:// URI를 올바르게 처리함.
export const uploadToS3 = (presignedUrl: string, imageUri: string): Promise<void> =>
    new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', presignedUrl)
        xhr.setRequestHeader('Content-Type', 'image/jpeg')
        xhr.onload = () => {
            console.log('S3 응답 status:', xhr.status)
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve()
            } else {
                reject(new Error(`S3 upload failed: ${xhr.status}`))
            }
        }
        xhr.onerror = () => reject(new Error('S3 XHR network error'))
        xhr.send({ uri: imageUri, type: 'image/jpeg', name: 'upload.jpg' } as any)
    })