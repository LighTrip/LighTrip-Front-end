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

export type ClusterDetailItem = {
  passportId: number;
  thumbnailUrl: string;
  spaceName: string;
  districtCategory: string;
  districtDisplayName: string;
  category: string;
  categoryDisplayName: string;
  visitedAt: string;
  visibility: string;
  likeCount: number;
  scrapCount: number;
  theme?: string;
};

export type ClusterDetailParams = BBoxParams & {
  cursor?: number;
  size?: number;
};

export const getMyLights = (params: BBoxParams) =>
  axiosInstance.get(API_ENDPOINTS.LIGHTS.GET_MY_LIGHTS, { params });

export const getClusterDetail = (params: ClusterDetailParams) =>
  axiosInstance.get(API_ENDPOINTS.LIGHTS.GET_CLUSTER_DETAIL, { params });
