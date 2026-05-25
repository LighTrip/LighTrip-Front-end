import axiosInstance from '@/src/api/axiosInstance'
import { API_ENDPOINTS } from '@/src/api/config'

export type LikePassport = {
    likeId: number
    likeCreatedAt: string
    passportId: number
    thumbnailUrl: string
    content: string
    address: string
    spaceName: string
    likeCount: number
    scrapCount: number
}

// 내 좋아요 목록 조회
export const getMyLikes = (params?: { cursor?: number; size?: number }) =>
    axiosInstance.get(API_ENDPOINTS.LIKE.GET_MY_LIKES, { params })

// 좋아요
export const likePassport = (passportId: number) =>
    axiosInstance.post(API_ENDPOINTS.LIKE.LIKE(passportId))

// 좋아요 취소
export const unlikePassport = (passportId: number) =>
    axiosInstance.delete(API_ENDPOINTS.LIKE.UNLIKE(passportId))