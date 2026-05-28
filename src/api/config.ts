import { Platform } from "react-native";

const getBaseURL = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL_IOS && Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_API_URL_IOS
  }
  if (process.env.EXPO_PUBLIC_API_URL_ANDROID && Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_API_URL_ANDROID
  }
  return 'https://api.lightrip.cloud'
}

export const BASE_URL = getBaseURL();

export const API_ENDPOINTS = {
  AUTH: {},

  SIGNUP: {},

  USER: {},

  PASSPORT: {
    // 여권 등록
    CREATE: '/api/v1/passports',
    // 여권 상세 조회
    GET_DETAIL: (passportId: number) => `/api/v1/passports/${passportId}`,
    // 여권 수정
    UPDATE: (passportId: number) => `/api/v1/passports/${passportId}`,
    // 여권 삭제
    DELETE: (passportId: number) => `/api/v1/passports/${passportId}`,
    // 여권 공개 범위 수정
    UPDATE_VISIBILITY: (passportId: number) => `/api/v1/passports/${passportId}/visibility`,
    // 내 여권 목록 조회 (리스트)
    GET_MY_LIST: '/api/v1/passports/me',
    // 여권 통계 조회
    GET_MY_STATS: '/api/v1/passports/stats/me',
    // 지역별 여권 목록 조회
    GET_DISTRICT_PASSPORTS: (districtCategory: string) => `/api/v1/passports/districts/${districtCategory}`,
    // 여권 지역 목록 조회
    GET_MY_DISTRICTS: '/api/v1/passports/districts/me',
    // 카테고리별 여권 목록 조회
    GET_BY_CATEGORY: (category: string) => `/api/v1/passports/categories/${category}`,
  },

  IMAGE: {
    PRESIGNED_URL: '/api/v1/images/presigned-url',
  },

  SCRAP: {
    SCRAP: (passportId: number) => `/api/v1/passports/${passportId}/scrap`,
    UNSCRAP: (passportId: number) => `/api/v1/passports/${passportId}/scrap`,
    GET_MY_SCRAPS: '/api/v1/passports/scraps/me',
  },

  LIKE: {
    LIKE: (passportId: number) => `/api/v1/passports/${passportId}/likes`,
    UNLIKE: (passportId: number) => `/api/v1/passports/${passportId}/likes`,
    GET_MY_LIKES: '/api/v1/passports/likes/me',
  },

  AI: {
    DRAFT: '/api/v1/ai/draft',
  },

  DISTRICTCOVER:{
    TEXT: (coverId: number) => `/api/v1/district-covers/${coverId}/text-color`,
    IMAGE: (coverId: number) => `/api/v1/district-covers/${coverId}/image`,
  }
} as const;

export default API_ENDPOINTS;
