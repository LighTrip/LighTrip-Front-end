import axiosInstance from '@/src/api/axiosInstance'
import { API_ENDPOINTS } from '@/src/api/config'

export type ScrapPassport = {
    scrapId: number
    scrapCreatedAt: string
    passportId: number
    thumbnailUrl: string
    content: string
    address: string
    spaceName: string
    likeCount: number
    scrapCount: number
}

// 내 스크랩 목록 조회
export const getMyScraps = (params?: { cursor?: number; size?: number }) =>
    axiosInstance.get(API_ENDPOINTS.SCRAP.GET_MY_SCRAPS, { params })

// 스크랩
export const scrapPassport = (passportId: number) =>
    axiosInstance.post(API_ENDPOINTS.SCRAP.SCRAP(passportId))

// 스크랩 취소
export const unscrapPassport = (passportId: number) =>
    axiosInstance.delete(API_ENDPOINTS.SCRAP.UNSCRAP(passportId))