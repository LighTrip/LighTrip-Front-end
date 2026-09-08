import axiosInstance from '@/src/api/axiosInstance'
import { API_ENDPOINTS } from '@/src/api/config'

export type ReportReason =
    | "SPAM"
    | "ABUSE"
    | "SEXUAL"
    | "COPYRIGHT"
    | "FALSE_INFO"
    | "ETC"

export type CreatePassportReportPayload = {
    reason: ReportReason
    detail: string | null
}

// 게시물(여권) 신고
export const createPassportReport = (
    passportId: number,
    payload: CreatePassportReportPayload,
) =>
    axiosInstance.post(
        API_ENDPOINTS.REPORT.CREATE_PASSPORT_REPORT(passportId),
        payload,
    )
