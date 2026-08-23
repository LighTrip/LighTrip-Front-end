// src/api/authToken.ts
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { BASE_URL } from './config'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

// 만료 직전 요청이 서버에 닿는 사이 만료되는 것을 막기 위해 30초 먼저 재발급한다.
const EXPIRY_SKEW_MS = 30 * 1000

// iOS 기본값(WHEN_UNLOCKED)은 기기가 잠겨 있는 동안 읽기가 실패한다.
// 잠금 상태에서도 토큰을 읽어야 하므로 '첫 잠금해제 이후 접근 가능'으로 저장한다.
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
}

type AuthExpiredHandler = () => void

let authExpiredHandler: AuthExpiredHandler | null = null

// 재발급까지 실패해 로그아웃될 때 호출된다. app/_layout.tsx 가 로그인 화면 이동을 등록한다.
export const setAuthExpiredHandler = (handler: AuthExpiredHandler | null) => {
    authExpiredHandler = handler
}

export const getAccessToken = async () => {
    try {
        return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
    } catch (error) {
        console.error('accessToken 읽기 실패', error)
        return null
    }
}

export const getRefreshToken = async () => {
    try {
        return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
    } catch (error) {
        console.error('refreshToken 읽기 실패', error)
        return null
    }
}

export const saveTokens = async (accessToken: string, refreshToken?: string | null) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken, SECURE_STORE_OPTIONS)

    if (refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken, SECURE_STORE_OPTIONS)
    }
}

// 계정에 종속된 로컬 데이터. 로그아웃·탈퇴·세션 만료 시 함께 지워야 한다.
// 토큰만 지우면 다음 계정에서 이전 계정의 팀 정보가 그대로 보인다.
const USER_SCOPED_KEYS = [
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
    'teamId',
    'teamCode',
    'teamName',
    'teamModeEnabled',
    'liveLocationSharing',
]

export const clearTokens = async () => {
    await Promise.all(
        USER_SCOPED_KEYS.map((key) =>
            SecureStore.deleteItemAsync(key).catch(() => undefined),
        ),
    )
}

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

// Hermes 에 atob 이 없는 환경을 대비해 직접 디코딩한다.
// JWT payload 의 exp(숫자)만 읽으면 되므로 최소 구현으로 충분하다.
const decodeBase64Url = (value: string) => {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/')

    let buffer = 0
    let bitCount = 0
    let decoded = ''

    for (const char of normalized) {
        const index = BASE64_ALPHABET.indexOf(char)
        if (index === -1) continue

        buffer = (buffer << 6) | index
        bitCount += 6

        if (bitCount >= 8) {
            bitCount -= 8
            decoded += String.fromCharCode((buffer >> bitCount) & 0xff)
        }
    }

    return decoded
}

// 토큰 만료 시각(ms). exp 를 읽을 수 없으면 null.
export const getTokenExpiryMs = (token: string): number | null => {
    const segments = token.split('.')
    if (segments.length !== 3) return null

    try {
        const payload = JSON.parse(decodeBase64Url(segments[1]))
        return typeof payload?.exp === 'number' ? payload.exp * 1000 : null
    } catch {
        return null
    }
}

export const isTokenExpired = (token: string, skewMs = EXPIRY_SKEW_MS) => {
    const expiresAt = getTokenExpiryMs(token)

    // exp 를 못 읽으면 만료 여부를 서버 판단에 맡긴다.
    if (expiresAt === null) return false

    return Date.now() >= expiresAt - skewMs
}

const handleAuthExpired = async () => {
    await clearTokens()
    authExpiredHandler?.()
}

const requestNewAccessToken = async (): Promise<string | null> => {
    const refreshToken = await getRefreshToken()

    // 이 버전 이전에 로그인한 사용자는 refreshToken 이 저장돼 있지 않다. 다시 로그인시킨다.
    if (!refreshToken) {
        await handleAuthExpired()
        return null
    }

    try {
        // axiosInstance 를 쓰면 인터셉터가 재귀 호출되므로 순수 axios 로 보낸다.
        const response = await axios.post(`${BASE_URL}/auth/refresh`, null, {
            headers: { 'Refresh-Token': refreshToken },
            timeout: 10000,
        })

        const accessToken: string | undefined = response.data?.accessToken

        if (!accessToken) {
            await handleAuthExpired()
            return null
        }

        // 서버가 refreshToken 을 회전시켜 내려주면 함께 갱신한다.
        await saveTokens(accessToken, response.data?.refreshToken)

        return accessToken
    } catch (error) {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined

        // 4xx 는 refreshToken 자체가 만료·무효라는 뜻이므로 로그아웃 처리한다.
        if (status !== undefined && status >= 400 && status < 500) {
            await handleAuthExpired()
            return null
        }

        // 네트워크 오류나 서버 장애는 로그아웃 사유가 아니다. 토큰을 지우지 않는다.
        throw error
    }
}

let refreshPromise: Promise<string | null> | null = null

// 동시에 여러 요청이 만료를 감지해도 재발급은 한 번만 수행한다.
export const refreshAccessToken = async (): Promise<string | null> => {
    if (!refreshPromise) {
        refreshPromise = requestNewAccessToken().finally(() => {
            refreshPromise = null
        })
    }

    return refreshPromise
}

// 앱 전역에서 토큰이 필요할 때 쓰는 진입점. 만료됐으면 먼저 재발급한다.
export const getValidAccessToken = async (): Promise<string | null> => {
    const accessToken = await getAccessToken()

    if (!accessToken) return null
    if (!isTokenExpired(accessToken)) return accessToken

    try {
        return await refreshAccessToken()
    } catch (error) {
        console.error('accessToken 재발급 실패', error)

        // 일시적 실패면 기존 토큰으로라도 요청해 본다. 최종 판단은 서버가 한다.
        return accessToken
    }
}
