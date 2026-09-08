import axiosInstance from '@/src/api/axiosInstance'
import { API_ENDPOINTS } from '@/src/api/config'

// 차단한 사용자 항목 (GET /api/v1/users/me/blocks 응답)
export type BlockedUser = {
    blockId: number
    userId: number
    nickname: string
    profileImg: string | null
    blockedAt: string
}

// 사용자 차단
export const blockUser = (userId: number) =>
    axiosInstance.post(API_ENDPOINTS.BLOCK.BLOCK_USER(userId))

// 사용자 차단 해제
export const unblockUser = (userId: number) =>
    axiosInstance.delete(API_ENDPOINTS.BLOCK.UNBLOCK_USER(userId))

// 내 차단 목록 조회
export const getMyBlocks = (params?: { cursor?: number; size?: number }) =>
    axiosInstance.get(API_ENDPOINTS.BLOCK.GET_MY_BLOCKS, { params })
