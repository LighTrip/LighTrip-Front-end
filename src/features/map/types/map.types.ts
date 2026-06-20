import { LightItem } from "@/src/api/lights.api";

export interface PassportPreview {
  passportId: number;
  spaceName: string;
  address: string;
  visitedAt: string;
  imageUrl: string | null;
  musicTitle: string | null;
  musicArtist: string | null;
  category: string;
}

export interface BBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface PickedLocation {
  latitude: number;
  longitude: number;
  address: string | null;
}

export interface FrontCluster {
  id: string;
  centerLat: number;
  centerLng: number;
  items: LightItem[];
}
