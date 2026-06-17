import axiosInstance from '@/src/api/axiosInstance'
import { API_ENDPOINTS } from '@/src/api/config'

export type PassportCategory = 'CAFE' | 'RESTAURANT' | 'BAR' | 'CULTURE' | 'ACTIVITY' | 'SHOPPING' | 'NATURE' | 'ETC'
export type Visibility = 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE'

export const CATEGORY_MAP: Record<string, PassportCategory> = {
    '☕ 카페': 'CAFE',
    '🍽️ 식당': 'RESTAURANT',
    '🍶 술집': 'BAR',
    '🏞️ 공원': 'NATURE',
    '🎬 문화': 'CULTURE',
    '🏋️ 운동': 'ACTIVITY',
    '🛍️ 쇼핑': 'SHOPPING',
    '📦 기타': 'ETC',
}

// 여권 등록용
export type CreatePassportRequest = {
    imageUrls: string[]
    content: string
    latitude: number
    longitude: number
    address: string
    visitedAt: string
    category: PassportCategory
    districtCategory: string
    visibility?: Visibility
    draft?: string
    aiCategory?: string
    district?: string
    spaceName?: string
    musicTitle?: string
    musicArtist?: string
    teamId?: string
    theme?: string
}

// 여권 등록
export const createPassport = (data: CreatePassportRequest) =>
    axiosInstance.post(API_ENDPOINTS.PASSPORT.CREATE, data)

// 여권 수정 요청 시 반환되는 데이터 타입
export type UpdatePassportResponse = {
    passportId: number
    imageUrls: string[]
    content: string
    latitude: number
    longitude: number
    address: string
    visitedAt: string
    district: string
    spaceName: string
    category: PassportCategory
    districtCategory: string
    visibility: Visibility
    musicTitle?: string
    musicArtist?: string
    likeCount: number
    scrapCount: number
}

// 여권 수정
export const updatePassport = (passportId: number, data: Partial<CreatePassportRequest>) =>
    axiosInstance.patch(API_ENDPOINTS.PASSPORT.UPDATE(passportId), data)

// 여권 삭제
export const deletePassport = (passportId: number) =>
    axiosInstance.delete(API_ENDPOINTS.PASSPORT.DELETE(passportId))

// 여권 상세 조회용 (전체)
export type PassportDetailType = {
    passportId: number
    imageUrls: string[]
    content: string
    latitude: number
    longitude: number
    address: string
    visitedAt: string
    category: PassportCategory
    districtCategory: string
    visibility: Visibility
    spaceName: string
    district: string
    musicTitle?: string
    musicArtist?: string
}

// 도장 뷰 목록 조회용
export type MyPassport = {
    passportId: number
    thumbnailUrl: string
    spaceName: string
    districtCategory: string
    districtDisplayName: string
    category: PassportCategory
    categoryDisplayName: string
    visitedAt: string
    visibility: Visibility
    likeCount: number
    scrapCount: number
}

// 내 여권 목록 조회
export const getMyPassports = (params?: { category?: string; districtCategory?: string; cursor?: number; size?: number }) =>
    axiosInstance.get(API_ENDPOINTS.PASSPORT.GET_MY_LIST, { params })

// 여권 상세 조회
export const getPassportDetail = (passportId: number) =>
    axiosInstance.get(API_ENDPOINTS.PASSPORT.GET_DETAIL(passportId))

// 여권 통계 조회
export const getMyPassportStats = () =>
    axiosInstance.get(API_ENDPOINTS.PASSPORT.GET_MY_STATS)

// 여권 지역 목록 조회 (커버)
export const getMyPassportDistricts = () =>
    axiosInstance.get(API_ENDPOINTS.PASSPORT.GET_MY_DISTRICTS)

// 여권 지역별 상세 조회
export const getDistrictsPassports = (districtCategory: string) =>
    axiosInstance.get(API_ENDPOINTS.PASSPORT.GET_DISTRICT_PASSPORTS(districtCategory))

// 여권 공개 범위 수정
export const changePassportVisibility = (passportId: number, visibility: Visibility) =>
    axiosInstance.patch(API_ENDPOINTS.PASSPORT.UPDATE_VISIBILITY(passportId), { visibility })

// 여권 커버 텍스트 (textColor: #RRGGBB hex 문자열)
export const textColor = (coverId: number, colorHex: string) =>
    axiosInstance.patch(API_ENDPOINTS.DISTRICTCOVER.TEXT(coverId), { textColor: colorHex })

// 여권 커버 사진 설정
export const changeCoverImage = (coverId: number, imageUrl: string) =>
    axiosInstance.patch(API_ENDPOINTS.DISTRICTCOVER.IMAGE(coverId), { imageUrl })