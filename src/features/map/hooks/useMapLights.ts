import { getMyLights } from "@/src/api/lights.api";
import { LightItem } from "@/src/api/lights.api";
import { useCallback, useEffect, useRef, useState } from "react";
import { INITIAL_BBOX } from "../constants/mapConstants";
import { BBox } from "../types/map.types";
import { cameraToBBox } from "../utils/mapUtils";

export function useMapLights() {
  const [lights, setLights] = useState<LightItem[]>([]);
  const [currentBBox, setCurrentBBox] = useState<BBox | null>(INITIAL_BBOX);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadLights = useCallback(async (bbox: BBox) => {
    try {
      const res = await getMyLights(bbox);
      const data = res.data.data;
      const items: LightItem[] = Array.isArray(data) ? data : [];
      setLights(items);
    } catch (e: any) {
      console.error("lights fetch 실패:", e.message);
      setLights([]);
    }
  }, []);

  useEffect(() => {
    loadLights(INITIAL_BBOX);
  }, []);

  const handleCameraChanged = useCallback(
    (event: any, pickingLocation: boolean) => {
      const lat = event?.latitude;
      const lng = event?.longitude;

      if (pickingLocation) return undefined;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        const bbox = cameraToBBox(event);
        if (bbox) {
          setCurrentBBox(bbox);
          loadLights(bbox);
        }
      }, 400);

      return { latitude: lat, longitude: lng };
    },
    [loadLights],
  );

  return { lights, currentBBox, loadLights, handleCameraChanged };
}
