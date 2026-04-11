import { Platform } from "react-native";

const getBaseURL = (): string => {
  return Platform.select({
    android: process.env.EXPO_PUBLIC_API_URL_ANDROID || "http://10.0.2.2:8080",
    ios: process.env.EXPO_PUBLIC_API_URL_IOS || "http://localhost:8080",
    default: process.env.EXPO_PUBLIC_API_URL_ANDROID || "http://localhost:8080",
  });
};

export const BASE_URL = getBaseURL();

export const API_ENDPOINTS = {
  AUTH: {},

  SIGNUP: {},

  USER: {},
} as const;

export default API_ENDPOINTS;
