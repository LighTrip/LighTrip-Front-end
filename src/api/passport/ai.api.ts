import * as SecureStore from 'expo-secure-store'
import { BASE_URL, API_ENDPOINTS } from '@/src/api/config'

// 초안 생성 - imageUrl은 S3 CDN URL이어야 함 (백엔드가 직접 다운로드)
export const generateAIDraft = async (imageUrl: string, description: string) => {
    const token = await SecureStore.getItemAsync('accessToken')

    const params = new URLSearchParams({ imageUrl })
    if (description) params.append('text', description)
    const url = `${BASE_URL}${API_ENDPOINTS.AI.DRAFT}?${params.toString()}`

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    })

    const contentType = response.headers.get('content-type') ?? ''
    let data: any
    if (contentType.includes('application/json')) {
        data = await response.json()
    } else {
        const text = await response.text()
        data = { message: text }
    }

    if (!response.ok) {
        const error: any = new Error(`Request failed with status code ${response.status}`)
        error.response = { status: response.status, data }
        throw error
    }

    return data
}
