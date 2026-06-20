import { LightItem } from "@/src/api/lights.api";
import { BBox, FrontCluster } from "../types/map.types";
import { NCP_CLIENT_ID, NCP_CLIENT_SECRET } from "../constants/mapConstants";

export function clusterSingleMarkers(items: LightItem[], bbox: BBox | null): FrontCluster[] {
  const latSpan = bbox ? bbox.maxLat - bbox.minLat : 0.1;
  const lngSpan = bbox ? bbox.maxLng - bbox.minLng : 0.1;
  const radius = Math.max(0.000003, Math.sqrt(latSpan * latSpan + lngSpan * lngSpan) * 0.06);
  const singles = items.filter((it) => !it.isCluster);
  const assigned = new Array(singles.length).fill(false);
  const clusters: FrontCluster[] = [];

  singles.forEach((item, i) => {
    if (assigned[i]) return;
    const group: LightItem[] = [item];
    assigned[i] = true;
    singles.forEach((other, j) => {
      if (assigned[j]) return;
      const dlat = item.latitude - other.latitude;
      const dlng = item.longitude - other.longitude;
      if (Math.sqrt(dlat * dlat + dlng * dlng) <= radius) {
        group.push(other);
        assigned[j] = true;
      }
    });
    clusters.push({
      id: `fc-${i}`,
      centerLat: group.reduce((s, it) => s + it.latitude, 0) / group.length,
      centerLng: group.reduce((s, it) => s + it.longitude, 0) / group.length,
      items: group,
    });
  });
  return clusters;
}

export function dominantCategory(items: { category: string }[]): string {
  const freq: Record<string, number> = {};
  for (const { category } of items) freq[category] = (freq[category] ?? 0) + 1;
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "ETC";
}

export function cameraToBBox(event: any): BBox | null {
  const region = event?.region;
  if (
    region &&
    typeof region.latitude === "number" &&
    typeof region.longitude === "number" &&
    typeof region.latitudeDelta === "number" &&
    typeof region.longitudeDelta === "number"
  ) {
    return {
      minLat: region.latitude,
      maxLat: region.latitude + region.latitudeDelta,
      minLng: region.longitude,
      maxLng: region.longitude + region.longitudeDelta,
    };
  }
  const lat = event?.latitude;
  const lng = event?.longitude;
  if (!lat || !lng) return null;
  const delta = 0.05;
  return {
    minLat: lat - delta,
    maxLat: lat + delta,
    minLng: lng - delta,
    maxLng: lng + delta,
  };
}

export async function naverReverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${longitude},${latitude}&orders=roadaddr,addr&output=json`,
      {
        headers: {
          "x-ncp-apigw-api-key-id": NCP_CLIENT_ID,
          "x-ncp-apigw-api-key": NCP_CLIENT_SECRET,
        },
      },
    );
    const json = await res.json();
    const results = json.results;
    if (!Array.isArray(results) || results.length === 0) return null;

    const roadaddr = results.find((r: any) => r.name === "roadaddr");
    const addr = results.find((r: any) => r.name === "addr");
    const target = roadaddr ?? addr;
    if (!target) return null;

    const r = target.region;
    const area1 = r.area1?.name ?? "";
    const area2 = r.area2?.name ?? "";
    const area3 = r.area3?.name ?? "";
    const land = target.land;

    if (roadaddr && land?.name) {
      const building = land.addition0?.value ? ` ${land.addition0.value}` : "";
      return `${area1} ${area2} ${land.name} ${land.number1}${building}`.trim();
    }
    if (addr && land?.number1) {
      const number2 = land.number2 ? `-${land.number2}` : "";
      return `${area1} ${area2} ${area3} ${land.number1}${number2}`.trim();
    }
    return `${area1} ${area2} ${area3}`.trim() || null;
  } catch (e) {
    console.error("네이버 역지오코딩 실패:", e);
    return null;
  }
}
