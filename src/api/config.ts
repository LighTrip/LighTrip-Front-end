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
    CREATE: '/api/v1/passports',
    GET_DETAIL: (passportId: number) => `/api/v1/passports/${passportId}`,
    UPDATE: (passportId: number) => `/api/v1/passports/${passportId}`,
    DELETE: (passportId: number) => `/api/v1/passports/${passportId}`,
    UPDATE_VISIBILITY: (passportId: number) => `/api/v1/passports/${passportId}/visibility`,
    GET_MY_LIST: '/api/v1/passports/me',
    GET_MY_STATS: '/api/v1/passports/stats/me',
    GET_MY_DISTRICTS: '/api/v1/passports/districts/me',
    GET_BY_CATEGORY: (category: string) => `/api/v1/passports/categories/${category}`,
  },

  IMAGE: {
    PRESIGNED_URL: '/api/v1/images/presigned-url',
  },

  SCRAP: {
    SCRAP: (passportId: number) => `/api/v1/passports/${passportId}/scraps`,
    UNSCRAP: (passportId: number) => `/api/v1/passports/${passportId}/scraps`,
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
