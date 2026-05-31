import axiosInstance from '@/src/api/axiosInstance'
import { API_ENDPOINTS } from '@/src/api/config'

// 초안 생성
export const generateAIDraft = async (photoUri: string, description: string) => {
    const formData = new FormData()
    formData.append('image', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
    } as any)
    formData.append('text', description)

    const response = await axiosInstance.post(API_ENDPOINTS.AI.DRAFT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
}