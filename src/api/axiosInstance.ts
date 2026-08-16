// src/api/axiosInstance.ts
import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { getValidAccessToken, refreshAccessToken } from './authToken'
import { BASE_URL } from './config'

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

axiosInstance.interceptors.request.use(async (config) => {
    const token = await getValidAccessToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

type RetriableConfig = InternalAxiosRequestConfig & { _retriedAfterRefresh?: boolean }

// 서버는 만료된 토큰에 401 이 아니라 카카오 로그인 페이지로의 302 를 내려준다
// (SecurityConfig 에 AuthenticationEntryPoint 가 없어 oauth2Login 기본값이 쓰인다).
// React Native 는 리다이렉트를 자동으로 따라가므로 HTML 이 200 으로 도착한다.
const isLoginRedirect = (response: AxiosResponse) => {
    const responseUrl: string | undefined = (response.request as { responseURL?: string })?.responseURL
    if (responseUrl?.includes('/oauth2/authorization')) return true

    const contentType = response.headers?.['content-type']
    return typeof contentType === 'string' && contentType.includes('text/html')
}

// 재발급 후 원요청을 한 번만 재시도한다. 재발급이 안 되면 null.
const retryWithNewToken = async (config: RetriableConfig | undefined) => {
    if (!config || config._retriedAfterRefresh) return null

    config._retriedAfterRefresh = true

    const token = await refreshAccessToken().catch(() => null)
    if (!token) return null

    config.headers.Authorization = `Bearer ${token}`

    return axiosInstance(config)
}

axiosInstance.interceptors.response.use(
    async (response) => {
        if (isLoginRedirect(response)) {
            const retried = await retryWithNewToken(response.config as RetriableConfig)
            if (retried) return retried
        }

        return response
    },
    async (error) => {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined

        if (status === 401 || status === 403) {
            const retried = await retryWithNewToken(error.config as RetriableConfig)
            if (retried) return retried
        }

        return Promise.reject(error)
    },
)

export default axiosInstance
