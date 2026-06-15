import axiosInstance from "@/src/api/axiosInstance";
import { API_ENDPOINTS } from "@/src/api/config";

export type LightItem = {
  passportId: number;
  latitude: number;
  longitude: number;
  category: string;
  districtCategory: string;
  spaceName: string;
  thumbnailUrl: string;
  visitedAt: string;
  likeCount: number;
  scrapCount: number;
  isCluster: boolean;
  count?: number;
  centerLatitude?: number;
  centerLongitude?: number;
};

export type BBoxParams = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  teamId?: number;
};

export const getMyLights = (params: BBoxParams) =>
  axiosInstance.get(API_ENDPOINTS.LIGHTS.GET_MY_LIGHTS, { params });
