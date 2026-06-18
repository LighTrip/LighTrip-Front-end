import CafeIcon from "@/assets/icons/coffee.svg";
import CurrentLocationIcon from "@/assets/icons/current-location.svg";
import BarIcon from "@/assets/icons/drink.svg";
import EtcIcon from "@/assets/icons/etc.svg";
import ActivityIcon from "@/assets/icons/exercise.svg";
import CultureIcon from "@/assets/icons/movie.svg";
import NatureIcon from "@/assets/icons/park.svg";
import RestaurantIcon from "@/assets/icons/restaurant.svg";
import ShoppingIcon from "@/assets/icons/shopping.svg";
import {
  ClusterDetailItem,
  getClusterDetail,
  getMyLights,
  LightItem,
} from "@/src/api/lights.api";
import { getPassportDetail } from "@/src/api/passport/passport.api";
import PassportDetail from "@/src/features/passport/screens/PassportDetail";
import AddPlaceScreen from "@/src/features/place/screens/AddPlaceScreen";
import {
  NaverMapMarkerOverlay,
  NaverMapView,
} from "@mj-studio/react-native-naver-map";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  LogBox,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Path,
  RadialGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";

LogBox.ignoreLogs([
  'Unsupported top level event type "topSvgLayout" dispatched',
]);

const NAVY = "#0F2744";
const GREEN = "#34D399";
const GREEN_DARK = "#065F46";
const GREEN_MID = "#059669";

// 카테고리별 색상 (메인 / 어두운 버전)
const CATEGORY_COLORS: Record<string, { main: string; light: string }> = {
  CAFE: { main: "#F59E0B", light: "#FDE68A" }, // 앰버
  RESTAURANT: { main: "#EF4444", light: "#FCA5A5" }, // 레드
  BAR: { main: "#8B5CF6", light: "#C4B5FD" }, // 퍼플
  CULTURE: { main: "#3B82F6", light: "#93C5FD" }, // 블루
  ACTIVITY: { main: "#F97316", light: "#FDBA74" }, // 오렌지
  SHOPPING: { main: "#EC4899", light: "#F9A8D4" }, // 핑크
  NATURE: { main: "#10B981", light: "#6EE7B7" }, // 그린
  ETC: { main: "#6B7280", light: "#D1D5DB" }, // 그레이
};
const TAB_BAR_HEIGHT = 70;
const NCP_CLIENT_ID = process.env.EXPO_PUBLIC_NCP_CLIENT_ID ?? "";
const NCP_CLIENT_SECRET = process.env.EXPO_PUBLIC_NCP_CLIENT_SECRET ?? "";

// ─── 타입 ────────────────────────────────────────────────────────────────

interface PassportPreview {
  passportId: number;
  spaceName: string;
  address: string;
  visitedAt: string;
  imageUrl: string | null;
  musicTitle: string | null;
  musicArtist: string | null;
  category: string;
}

interface BBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

interface PickedLocation {
  latitude: number;
  longitude: number;
  address: string | null;
}

// 프론트 클러스터
interface FrontCluster {
  id: string;
  centerLat: number;
  centerLng: number;
  items: LightItem[];
}

// ─── 상수 ────────────────────────────────────────────────────────────────

const INITIAL_BBOX: BBox = {
  minLat: 37.41,
  maxLat: 37.72,
  minLng: 126.77,
  maxLng: 127.18,
};

// ─── 유틸 함수 ────────────────────────────────────────────────────────────

function clusterSingleMarkers(
  items: LightItem[],
  bbox: BBox | null,
): FrontCluster[] {
  const latSpan = bbox ? bbox.maxLat - bbox.minLat : 0.1;
  const lngSpan = bbox ? bbox.maxLng - bbox.minLng : 0.1;
  const radius = Math.max(
    0.000003,
    Math.sqrt(latSpan * latSpan + lngSpan * lngSpan) * 0.06,
  );
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

function dominantCategory(items: { category: string }[]): string {
  const freq: Record<string, number> = {};
  for (const { category } of items) freq[category] = (freq[category] ?? 0) + 1;
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "ETC";
}

function cameraToBBox(event: any): BBox | null {
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

async function naverReverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string | null> {
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

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────

// ─── SVG 마커 컴포넌트 ────────────────────────────────────────────────────
// iOS New Architecture에서 NaverMapMarkerOverlay 자식 View 렌더링 이슈로
// react-native-svg를 사용해 마커를 구현합니다.

function UserLocationMarker() {
  // 40×40, anchor (0.5, 0.5)
  return (
    <View style={{ width: 40, height: 40 }}>
      <Svg width={40} height={40} viewBox="0 0 40 40">
        <Circle
          cx={20}
          cy={20}
          r={13}
          fill="rgba(52,211,153,0.25)"
          stroke="rgba(52,211,153,0.5)"
          strokeWidth={1.5}
        />
        <Circle
          cx={20}
          cy={20}
          r={6}
          fill={GREEN}
          stroke="white"
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
}

// 카테고리 → SVG 컴포넌트 매핑
// SVG 파일을 바텀시트 등 standalone용으로 사용
const CATEGORY_ICONS: Record<
  string,
  React.FC<{ width?: number; height?: number; fill?: string }>
> = {
  CAFE: CafeIcon,
  RESTAURANT: RestaurantIcon,
  BAR: BarIcon,
  CULTURE: CultureIcon,
  ACTIVITY: ActivityIcon,
  SHOPPING: ShoppingIcon,
  NATURE: NatureIcon,
  ETC: EtcIcon,
};

const CATEGORY_PATHS: Record<string, string[]> = {
  CAFE: [
    "M11 18C9.05 18 7.396 17.321 6.038 15.963C4.68 14.605 4.00067 12.9507 4 11V5C4 4.45 4.196 3.97933 4.588 3.588C4.98 3.19667 5.45067 3.00067 6 3H18.5C19.4667 3 20.2917 3.34167 20.975 4.025C21.6583 4.70833 22 5.53333 22 6.5C22 7.46667 21.6583 8.29167 20.975 8.975C20.2917 9.65833 19.4667 10 18.5 10H18V11C18 12.95 17.321 14.6043 15.963 15.963C14.605 17.3217 12.9507 18.0007 11 18ZM6 8H16V5H6V8ZM18 8H18.5C18.9167 8 19.271 7.85433 19.563 7.563C19.855 7.27167 20.0007 6.91733 20 6.5C19.9993 6.08267 19.8537 5.72867 19.563 5.438C19.2723 5.14733 18.918 5.00133 18.5 5H18V8ZM4 21V19H20V21H4Z",
  ],
  RESTAURANT: [
    "M7 9V3C7 2.71667 7.096 2.47934 7.288 2.288C7.48 2.09667 7.71733 2.00067 8 2C8.28267 1.99934 8.52033 2.09534 8.713 2.288C8.90567 2.48067 9.00133 2.718 9 3V9H10V3C10 2.71667 10.096 2.47934 10.288 2.288C10.48 2.09667 10.7173 2.00067 11 2C11.2827 1.99934 11.5203 2.09534 11.713 2.288C11.9057 2.48067 12.0013 2.718 12 3V9C12 9.93334 11.7127 10.75 11.138 11.45C10.5633 12.15 9.85067 12.6167 9 12.85V21C9 21.2833 8.904 21.521 8.712 21.713C8.52 21.905 8.28267 22.0007 8 22C7.71733 21.9993 7.48 21.9033 7.288 21.712C7.096 21.5207 7 21.2833 7 21V12.85C6.15 12.6167 5.43767 12.15 4.863 11.45C4.28833 10.75 4.00067 9.93334 4 9V3C4 2.71667 4.096 2.47934 4.288 2.288C4.48 2.09667 4.71733 2.00067 5 2C5.28267 1.99934 5.52033 2.09534 5.713 2.288C5.90567 2.48067 6.00133 2.718 6 3V9H7ZM17 14H15C14.7167 14 14.4793 13.904 14.288 13.712C14.0967 13.52 14.0007 13.2827 14 13V7C14 5.83334 14.4293 4.70834 15.288 3.625C16.1467 2.54167 17.034 2 17.95 2C18.25 2 18.5 2.11667 18.7 2.35C18.9 2.58334 19 2.85834 19 3.175V21C19 21.2833 18.904 21.521 18.712 21.713C18.52 21.905 18.2827 22.0007 18 22C17.7173 21.9993 17.48 21.9033 17.288 21.712C17.096 21.5207 17 21.2833 17 21V14Z",
  ],
  BAR: [
    "M7.7998 2.3999C7.00416 2.3999 6.24109 2.71597 5.67848 3.27858C5.11588 3.84119 4.7998 4.60425 4.7998 5.3999V19.4999C4.7998 20.6591 5.7406 21.5999 6.8998 21.5999H15.8998C16.4568 21.5999 16.9909 21.3787 17.3847 20.9848C17.7786 20.591 17.9998 20.0569 17.9998 19.4999V17.9999H18.5998C19.3955 17.9999 20.1585 17.6838 20.7211 17.1212C21.2837 16.5586 21.5998 15.7956 21.5998 14.9999V8.9999C21.5998 8.20425 21.2837 7.44119 20.7211 6.87858C20.1585 6.31597 19.3955 5.9999 18.5998 5.9999H17.9998V5.3999C17.9998 4.60425 17.6837 3.84119 17.1211 3.27858C16.5585 2.71597 15.7955 2.3999 14.9998 2.3999H7.7998ZM17.9998 7.1999H18.5998C19.0772 7.1999 19.535 7.38954 19.8726 7.72711C20.2102 8.06468 20.3998 8.52251 20.3998 8.9999V14.9999C20.3998 15.4773 20.2102 15.9351 19.8726 16.2727C19.535 16.6103 19.0772 16.7999 18.5998 16.7999H17.9998V7.1999ZM5.9998 5.3999C5.9998 4.92251 6.18945 4.46468 6.52701 4.12711C6.86458 3.78954 7.32241 3.5999 7.7998 3.5999H14.9998C15.4772 3.5999 15.935 3.78954 16.2726 4.12711C16.6102 4.46468 16.7998 4.92251 16.7998 5.3999V5.9999H5.9998V5.3999ZM14.9998 9.5999V16.7999C14.9998 16.959 14.9366 17.1116 14.8241 17.2242C14.7115 17.3367 14.5589 17.3999 14.3998 17.3999C14.2407 17.3999 14.0881 17.3367 13.9755 17.2242C13.863 17.1116 13.7998 16.959 13.7998 16.7999V9.5999C13.7998 9.44077 13.863 9.28816 13.9755 9.17564C14.0881 9.06312 14.2407 8.9999 14.3998 8.9999C14.5589 8.9999 14.7115 9.06312 14.8241 9.17564C14.9366 9.28816 14.9998 9.44077 14.9998 9.5999ZM11.3998 8.9999C11.5589 8.9999 11.7115 9.06312 11.8241 9.17564C11.9366 9.28816 11.9998 9.44077 11.9998 9.5999V16.7999C11.9998 16.959 11.9366 17.1116 11.8241 17.2242C11.7115 17.3367 11.5589 17.3999 11.3998 17.3999C11.2407 17.3999 11.0881 17.3367 10.9755 17.2242C10.863 17.1116 10.7998 16.959 10.7998 16.7999V9.5999C10.7998 9.44077 10.863 9.28816 10.9755 9.17564C11.0881 9.06312 11.2407 8.9999 11.3998 8.9999ZM8.9998 9.5999V16.7999C8.9998 16.959 8.93659 17.1116 8.82407 17.2242C8.71155 17.3367 8.55893 17.3999 8.3998 17.3999C8.24067 17.3999 8.08806 17.3367 7.97554 17.2242C7.86302 17.1116 7.7998 16.959 7.7998 16.7999V9.5999C7.7998 9.44077 7.86302 9.28816 7.97554 9.17564C8.08806 9.06312 8.24067 8.9999 8.3998 8.9999C8.55893 8.9999 8.71155 9.06312 8.82407 9.17564C8.93659 9.28816 8.9998 9.44077 8.9998 9.5999Z",
  ],
  CULTURE: [
    "M20 3H4C2.897 3 2 3.897 2 5V19C2 20.103 2.897 21 4 21H20C21.103 21 22 20.103 22 19V5C22 3.897 21.103 3 20 3ZM20.001 9C19.9997 9 19.9997 9 20.001 9H19.535L16.868 5H20L20.001 9ZM14.535 9L11.868 5H14.464L17.131 9H14.535ZM12.131 9H9.535L6.869 5H9.465L12.131 9ZM4 5H4.465L7.132 9H4V5Z",
  ],
  ACTIVITY: [
    "M20.9754 9.02508L14.9254 2.97508L15.3504 2.55008C15.7337 2.16675 16.2087 1.97941 16.7754 1.98808C17.3421 1.99675 17.8171 2.19241 18.2004 2.57508L21.4254 5.80008C21.8087 6.18341 22.0004 6.65441 22.0004 7.21308C22.0004 7.77175 21.8087 8.24241 21.4254 8.62508L20.9754 9.02508ZM8.65039 21.4001C8.26706 21.7834 7.79639 21.9751 7.23839 21.9751C6.68039 21.9751 6.20939 21.7834 5.82539 21.4001L2.60039 18.1751C2.21706 17.7917 2.02539 17.3211 2.02539 16.7631C2.02539 16.2051 2.21706 15.7341 2.60039 15.3501L3.00039 14.9501L9.05039 21.0001L8.65039 21.4001ZM12.2754 20.7001C12.0754 20.9001 11.8421 21.0001 11.5754 21.0001C11.3087 21.0001 11.0754 20.9001 10.8754 20.7001L3.30039 13.1251C3.10039 12.9251 3.00039 12.6917 3.00039 12.4251C3.00039 12.1584 3.10039 11.9251 3.30039 11.7251L4.72539 10.2751C4.92539 10.0751 5.16306 9.97508 5.43839 9.97508C5.71372 9.97508 5.95106 10.0751 6.15039 10.2751L7.72539 11.8501L11.8754 7.70008L10.3004 6.12508C10.1004 5.92508 10.0004 5.69175 10.0004 5.42508C10.0004 5.15841 10.1004 4.92508 10.3004 4.72508L11.7254 3.27508C11.9254 3.07508 12.1631 2.97508 12.4384 2.97508C12.7137 2.97508 12.9511 3.07508 13.1504 3.27508L20.7254 10.8501C20.9254 11.0501 21.0254 11.2877 21.0254 11.5631C21.0254 11.8384 20.9254 12.0757 20.7254 12.2751L19.2754 13.7001C19.0754 13.9001 18.8421 14.0001 18.5754 14.0001C18.3087 14.0001 18.0754 13.9001 17.8754 13.7001L16.3004 12.1251L12.1504 16.2751L13.7254 17.8501C13.9254 18.0501 14.0254 18.2874 14.0254 18.5621C14.0254 18.8367 13.9254 19.0744 13.7254 19.2751L12.2754 20.7001Z",
  ],
  SHOPPING: [
    "M19.5 16H6.5L4 6H22L19.5 16Z",
    "M1.5 3H3.25L4 6M4 6L6.5 16H19.5L22 6H4Z",
    "M6.5 21C7.32843 21 8 20.3284 8 19.5C8 18.6716 7.32843 18 6.5 18C5.67157 18 5 18.6716 5 19.5C5 20.3284 5.67157 21 6.5 21Z",
    "M19.5 21C20.3284 21 21 20.3284 21 19.5C21 18.6716 20.3284 18 19.5 18C18.6716 18 18 18.6716 18 19.5C18 20.3284 18.6716 21 19.5 21Z",
  ],
  NATURE: [
    "M10.0504 18H4.87538C4.47538 18 4.17538 17.825 3.97538 17.475C3.77538 17.125 3.79204 16.7833 4.02538 16.45L7.00038 12H6.92538C6.52538 12 6.22938 11.821 6.03738 11.463C5.84538 11.105 5.86638 10.759 6.10038 10.425L11.1754 3.17501C11.2754 3.04168 11.4004 2.93768 11.5504 2.86301C11.7004 2.78834 11.8504 2.75068 12.0004 2.75001C12.1504 2.74934 12.3004 2.78701 12.4504 2.86301C12.6004 2.93901 12.7254 3.04301 12.8254 3.17501L17.9004 10.425C18.1337 10.7583 18.1547 11.1043 17.9634 11.463C17.772 11.8217 17.476 12.0007 17.0754 12H17.0004L19.9754 16.45C20.2087 16.7833 20.2254 17.125 20.0254 17.475C19.8254 17.825 19.5254 18 19.1254 18H13.9504V21C13.9504 21.2833 13.8547 21.521 13.6634 21.713C13.472 21.905 13.2344 22.0007 12.9504 22H11.0504C10.767 22 10.5297 21.904 10.3384 21.712C10.147 21.52 10.051 21.2827 10.0504 21V18Z",
  ],
  ETC: [
    "M17.578 4.432L15.578 3.382C13.822 2.461 12.944 2 12 2C11.056 2 10.178 2.46 8.422 3.382L8.101 3.551L17.024 8.65L21.04 6.64C20.394 5.908 19.352 5.361 17.578 4.43M21.748 7.964L17.75 9.964V13C17.75 13.1989 17.671 13.3897 17.5303 13.5303C17.3897 13.671 17.1989 13.75 17 13.75C16.8011 13.75 16.6103 13.671 16.4697 13.5303C16.329 13.3897 16.25 13.1989 16.25 13V10.714L12.75 12.464V21.904C13.468 21.725 14.285 21.297 15.578 20.618L17.578 19.568C19.729 18.439 20.805 17.875 21.403 16.86C22 15.846 22 14.583 22 12.06V11.943C22 10.05 22 8.866 21.748 7.964ZM11.25 21.904V12.464L2.252 7.964C2 8.866 2 10.05 2 11.941V12.058C2 14.583 2 15.846 2.597 16.86C3.195 17.875 4.271 18.44 6.422 19.569L8.422 20.618C9.715 21.297 10.532 21.725 11.25 21.904ZM2.96 6.641L12 11.161L15.411 9.456L6.525 4.378L6.422 4.432C4.649 5.362 3.606 5.909 2.96 6.642",
  ],
};

// 단일 핀 마커 — 56×56
function PassportMarker({ category }: { spaceName: string; category: string }) {
  const { main, light } = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.ETC;
  const paths = CATEGORY_PATHS[category] ?? CATEGORY_PATHS.ETC;
  // 아이콘: 24×24 → 18×18, 중심 (28,28) 기준 정렬
  const scale = 18 / 24;
  const offset = 28 - 9;
  const gradOut = `pm_o_${category}`;
  const gradIn = `pm_i_${category}`;
  return (
    <View style={{ width: 56, height: 56 }}>
      <Svg width={56} height={56} viewBox="0 0 56 56">
        <Defs>
          <RadialGradient id={gradOut} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={main} stopOpacity={0.4} />
            <Stop offset="100%" stopColor={main} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id={gradIn} cx="40%" cy="35%" r="60%">
            <Stop offset="0%" stopColor={light} stopOpacity={1} />
            <Stop offset="100%" stopColor={main} stopOpacity={1} />
          </RadialGradient>
        </Defs>
        <Circle cx={28} cy={28} r={28} fill={`url(#${gradOut})`} />
        <Circle cx={28} cy={28} r={20} fill={main} fillOpacity={0.18} />
        <Circle cx={28} cy={28} r={15} fill={`url(#${gradIn})`} />
        <Circle cx={23} cy={22} r={4} fill="white" fillOpacity={0.25} />
        <G transform={`translate(${offset}, ${offset}) scale(${scale})`}>
          {paths.map((d, i) => (
            <Path key={i} d={d} fill="white" />
          ))}
        </G>
      </Svg>
    </View>
  );
}

// 글로우 마커 공통 베이스 (서버/프론트 클러스터 공유)
function GlowMarker({
  cx,
  cy,
  r,
  rMid,
  rInner,
  main,
  light,
  children,
}: {
  cx: number;
  cy: number;
  r: number;
  rMid: number;
  rInner: number;
  main: string;
  light: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <Defs>
        <RadialGradient id="gm_out" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={main} stopOpacity={0.4} />
          <Stop offset="100%" stopColor={main} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="gm_in" cx="40%" cy="35%" r="60%">
          <Stop offset="0%" stopColor={light} stopOpacity={1} />
          <Stop offset="100%" stopColor={main} stopOpacity={1} />
        </RadialGradient>
        <ClipPath id="gm_clip">
          <Circle cx={cx} cy={cy} r={rInner} />
        </ClipPath>
      </Defs>
      <Circle cx={cx} cy={cy} r={r} fill="url(#gm_out)" />
      <Circle cx={cx} cy={cy} r={rMid} fill={main} fillOpacity={0.2} />
      <Circle cx={cx} cy={cy} r={rInner} fill="url(#gm_in)" />
      <Circle
        cx={cx - 5}
        cy={cy - 6}
        r={Math.round(rInner * 0.28)}
        fill="white"
        fillOpacity={0.25}
      />
      {children}
    </>
  );
}

/** 서버 클러스터 마커 — 56×56 */
function ServerClusterMarker({
  count,
  category,
}: {
  count: number;
  category: string;
}) {
  const { main, light } = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.ETC;
  return (
    <View style={{ width: 56, height: 56 }}>
      <Svg width={56} height={56} viewBox="0 0 56 56">
        <GlowMarker
          cx={28}
          cy={28}
          r={28}
          rMid={20}
          rInner={15}
          main={main}
          light={light}
        >
          <SvgText
            x={28}
            y={33}
            textAnchor="middle"
            fill="white"
            fontSize={13}
            fontWeight="bold"
            clipPath="url(#gm_clip)"
          >
            {String(count)}
          </SvgText>
        </GlowMarker>
      </Svg>
    </View>
  );
}

/** 프론트 클러스터 마커 — 64×64 */
function FrontClusterMarker({
  count,
  category,
}: {
  count: number;
  category: string;
}) {
  const { main, light } = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.ETC;
  return (
    <View style={{ width: 64, height: 64 }}>
      <Svg width={64} height={64} viewBox="0 0 64 64">
        <GlowMarker
          cx={32}
          cy={32}
          r={32}
          rMid={23}
          rInner={17}
          main={main}
          light={light}
        >
          <SvgText
            x={32}
            y={38}
            textAnchor="middle"
            fill="white"
            fontSize={15}
            fontWeight="bold"
            clipPath="url(#gm_clip)"
          >
            {String(count)}
          </SvgText>
        </GlowMarker>
      </Svg>
    </View>
  );
}

function CenterPin() {
  return (
    <View style={styles.centerPinWrapper} pointerEvents="none">
      <Text style={styles.centerPinEmoji}>📍</Text>
    </View>
  );
}

// ─── 바텀시트 ─────────────────────────────────────────────────────────────

interface ClusterBottomSheetProps {
  items: ClusterDetailItem[] | null;
  onClose: () => void;
  onSelectItem: (item: ClusterDetailItem) => void;
}

function ClusterBottomSheet({
  items,
  onClose,
  onSelectItem,
}: ClusterBottomSheetProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (items) {
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [items]);

  if (!items) return null;

  return (
    <Modal
      visible={!!items}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.sheetBackdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View
        style={[
          styles.sheetContainer,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [400, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.sheetHandle} />

        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>이 근처 장소 {items.length}곳</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={styles.sheetCloseText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={styles.sheetScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item, idx) => (
            <TouchableOpacity
              key={`sheet-item-${item.passportId ?? idx}`}
              style={styles.sheetItem}
              activeOpacity={0.75}
              onPress={() => onSelectItem(item)}
            >
              <View style={styles.sheetItemIcon}>
                {(() => {
                  const Icon = CATEGORY_ICONS[item.category] ?? EtcIcon;
                  return (
                    <Icon
                      width={24}
                      height={24}
                      fill={
                        (CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.ETC)
                          .main
                      }
                    />
                  );
                })()}
              </View>
              <View style={styles.sheetItemBody}>
                <Text style={styles.sheetItemName} numberOfLines={1}>
                  {item.spaceName}
                </Text>
              </View>
              <Text style={styles.sheetItemChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ─── PassportPreviewCard ─────────────────────────────────────────────────

interface PassportPreviewCardProps {
  preview: PassportPreview | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onOpenDetail: () => void;
}

function PassportPreviewCard({
  preview,
  loading,
  error,
  onClose,
  onOpenDetail,
}: PassportPreviewCardProps) {
  return (
    <View style={styles.previewCard}>
      <TouchableOpacity
        style={styles.previewCloseBtn}
        onPress={onClose}
        hitSlop={12}
      >
        <Text style={styles.previewCloseText}>✕</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.previewCenter}>
          <ActivityIndicator color={GREEN_MID} />
          <Text style={styles.previewLoadingText}>불러오는 중...</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.previewCenter}>
          <Text style={styles.previewErrorText}>⚠️ {error}</Text>
        </View>
      )}

      {preview && !loading && (
        <>
          {preview.imageUrl ? (
            <Image
              source={{ uri: preview.imageUrl }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.previewImagePlaceholder}>
              <Text style={styles.previewImagePlaceholderText}>🖼️</Text>
            </View>
          )}
          <View style={styles.previewBody}>
            <View style={styles.previewNameRow}>
              {(() => {
                const Icon = CATEGORY_ICONS[preview.category] ?? EtcIcon;
                const color = (
                  CATEGORY_COLORS[preview.category] ?? CATEGORY_COLORS.ETC
                ).main;
                return <Icon width={18} height={18} fill={color} />;
              })()}
              <Text style={styles.previewPlaceName} numberOfLines={1}>
                {preview.spaceName}
              </Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewRowIcon}>📍</Text>
              <Text style={styles.previewRowText} numberOfLines={1}>
                {preview.address}
              </Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewRowIcon}>🗓</Text>
              <Text style={styles.previewRowText}>{preview.visitedAt}</Text>
            </View>
            {preview.musicTitle && (
              <View style={styles.previewRow}>
                <Text style={styles.previewRowIcon}>🎵</Text>
                <Text style={styles.previewRowText} numberOfLines={1}>
                  {preview.musicTitle}
                  {preview.musicArtist ? ` — ${preview.musicArtist}` : ""}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.previewDetailBtn}
              activeOpacity={0.85}
              onPress={onOpenDetail}
            >
              <Text style={styles.previewDetailBtnText}>여권 상세보기</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

// ─── LocationConfirmCard ──────────────────────────────────────────────────

interface LocationConfirmCardProps {
  latitude: number;
  longitude: number;
  address: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function LocationConfirmCard({
  latitude,
  longitude,
  address,
  onConfirm,
  onCancel,
}: LocationConfirmCardProps) {
  return (
    <View style={styles.discoveryCard}>
      <View style={styles.placeNameBar}>
        <Text style={styles.placeNameText}>위치 확인</Text>
      </View>
      <View style={styles.discoveryBody}>
        <Text style={styles.discoveryTitle}>이 위치가 맞습니까?</Text>
        <Text style={styles.locationText}>
          {address ?? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`}
        </Text>
        <View style={[styles.discoveryActions, { marginTop: 10 }]}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={onConfirm}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmButtonText}>예</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onCancel}
            activeOpacity={0.85}
          >
            <Text style={styles.dismissButtonText}>아니요</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── 메인 스크린 ──────────────────────────────────────────────────────────

export default function MapScreen() {
  const { bottom: safeBottom, top: safeTop } = useSafeAreaInsets();

  const [showRegisterBtn, setShowRegisterBtn] = useState(true);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [lights, setLights] = useState<LightItem[]>([]);
  const [currentBBox, setCurrentBBox] = useState<BBox | null>(INITIAL_BBOX);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState<PassportPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [detailItem, setDetailItem] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [pickingLocation, setPickingLocation] = useState(false);
  const [showLocationConfirm, setShowLocationConfirm] = useState(false);
  const [cameraCenter, setCameraCenter] = useState({
    latitude: 37.5665,
    longitude: 126.978,
  });
  const [pickedLocation, setPickedLocation] = useState<PickedLocation | null>(
    null,
  );
  const [addressLoading, setAddressLoading] = useState(false);

  const [activeClusterItems, setActiveClusterItems] = useState<
    ClusterDetailItem[] | null
  >(null);

  const mapRef = useRef<any>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baseBottom = TAB_BAR_HEIGHT + safeBottom + 12;

  const frontClusters = clusterSingleMarkers(lights, currentBBox);

  const loadLights = useCallback(async (bbox: BBox) => {
    try {
      const res = await getMyLights(bbox);
      const data = res.data.data;
      const items: LightItem[] = Array.isArray(data) ? data : [];

      console.log(
        `[Lights] BBox: minLat=${bbox.minLat.toFixed(4)}, maxLat=${bbox.maxLat.toFixed(4)}, minLng=${bbox.minLng.toFixed(4)}, maxLng=${bbox.maxLng.toFixed(4)}`,
      );
      console.log(`[Lights] 총 ${items.length}개 마커`);

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
    (event: any) => {
      const lat = event?.latitude;
      const lng = event?.longitude;
      if (lat && lng) setCameraCenter({ latitude: lat, longitude: lng });

      if (pickingLocation) return;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        const bbox = cameraToBBox(event);
        if (bbox) {
          setCurrentBBox(bbox);
          loadLights(bbox);
        }
      }, 400);
    },
    [pickingLocation, loadLights],
  );

  const handleSinglePinTap = async (item: LightItem) => {
    setPreviewVisible(true);
    setPreviewData(null);
    setPreviewError(null);
    setPreviewLoading(true);
    try {
      const res = await getPassportDetail(item.passportId);
      const d = res.data.data;
      setPreviewData({
        passportId: d.passportId,
        spaceName: d.spaceName,
        address: d.address,
        visitedAt: d.visitedAt,
        imageUrl: d.imageUrls?.[0] ?? null,
        musicTitle: d.musicTitle ?? null,
        musicArtist: d.musicArtist ?? null,
        category: d.category ?? "ETC",
      });
    } catch {
      setPreviewError("장소 정보를 불러오지 못했어요.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleServerClusterTap = async (item: LightItem) => {
    const lat = item.centerLatitude ?? item.latitude;
    const lng = item.centerLongitude ?? item.longitude;
    const expectedCount = item.count ?? 0;

    // 뷰 폭 기준으로 초기 셀 크기 추정, count가 맞을 때까지 절반씩 축소 (최대 6회)
    const viewLatSpan = currentBBox
      ? currentBBox.maxLat - currentBBox.minLat
      : 0.1;
    const viewLngSpan = currentBBox
      ? currentBBox.maxLng - currentBBox.minLng
      : 0.1;

    try {
      let content: ClusterDetailItem[] = [];
      let divisor = 10;
      for (let attempt = 0; attempt < 6; attempt++) {
        const halfLat = viewLatSpan / divisor / 2;
        const halfLng = viewLngSpan / divisor / 2;
        const res = await getClusterDetail({
          minLat: lat - halfLat,
          maxLat: lat + halfLat,
          minLng: lng - halfLng,
          maxLng: lng + halfLng,
          size: 50,
        });
        content = res.data.data?.content ?? [];
        if (content.length <= expectedCount) break;
        divisor *= 2;
      }

      if (content.length === 1) {
        handleSinglePinTap({
          ...content[0],
          latitude: lat,
          longitude: lng,
          isCluster: false,
        } as any);
      } else if (content.length > 1) {
        setActiveClusterItems(content);
      } else {
        mapRef.current?.animateCameraTo({
          latitude: lat,
          longitude: lng,
          zoom: 16,
          duration: 400,
        });
      }
    } catch {
      mapRef.current?.animateCameraTo({
        latitude: lat,
        longitude: lng,
        zoom: 16,
        duration: 400,
      });
    }
  };

  const handleFrontClusterTap = async (cluster: FrontCluster) => {
    if (cluster.items.length === 1) {
      handleSinglePinTap(cluster.items[0]);
      return;
    }
    // 아이템 실제 좌표로 정확한 BBox 계산
    const lats = cluster.items.map((it) => it.latitude);
    const lngs = cluster.items.map((it) => it.longitude);
    const pad = 0.0001;
    try {
      const res = await getClusterDetail({
        minLat: Math.min(...lats) - pad,
        maxLat: Math.max(...lats) + pad,
        minLng: Math.min(...lngs) - pad,
        maxLng: Math.max(...lngs) + pad,
        size: 50,
      });
      const content: ClusterDetailItem[] = res.data.data?.content ?? [];
      if (content.length > 0) {
        setActiveClusterItems(content);
      }
    } catch {
      // 폴백: 로컬 아이템 데이터 그대로 사용
      setActiveClusterItems(
        cluster.items.map((it) => ({
          passportId: it.passportId,
          thumbnailUrl: it.thumbnailUrl,
          spaceName: it.spaceName,
          districtCategory: it.districtCategory,
          districtDisplayName: it.districtCategory,
          category: it.category,
          categoryDisplayName: it.category,
          visitedAt: it.visitedAt,
          visibility: "PUBLIC",
          likeCount: it.likeCount,
          scrapCount: it.scrapCount,
        })),
      );
    }
  };

  const handleSheetItemSelect = (item: ClusterDetailItem) => {
    setActiveClusterItems(null);
    handleSinglePinTap({
      ...item,
      latitude: 0,
      longitude: 0,
      isCluster: false,
    } as any);
  };

  const handleOpenDetail = async () => {
    if (!previewData) return;
    setDetailLoading(true);
    try {
      const res = await getPassportDetail(previewData.passportId);
      setDetailItem(res.data.data);
      setPreviewVisible(false);
      setPreviewData(null);
    } catch (e) {
      console.error("상세 조회 실패:", e);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRegisterPress = () => {
    setShowRegisterBtn(false);
    setPickingLocation(true);
    setPreviewVisible(false);
  };

  const handlePinLocation = async () => {
    const { latitude, longitude } = cameraCenter;
    setAddressLoading(true);
    try {
      const address = await naverReverseGeocode(latitude, longitude);
      setPickedLocation({ latitude, longitude, address });
    } finally {
      setAddressLoading(false);
      setShowLocationConfirm(true);
    }
  };

  const handleLocationConfirm = () => {
    setPickingLocation(false);
    setShowLocationConfirm(false);
    setShowAddPlace(true);
  };

  const handleLocationCancel = () => {
    setShowLocationConfirm(false);
    setPickedLocation(null);
  };

  const handleLocationPress = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("위치 권한이 필요합니다.");
      return;
    }
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const { latitude, longitude } = location.coords;
    setUserLocation({ latitude, longitude });
    mapRef.current?.animateCameraTo({
      latitude,
      longitude,
      zoom: 16,
      duration: 500,
    });
  };

  return (
    <View style={styles.container}>
      <NaverMapView
        ref={mapRef}
        style={styles.map}
        initialCamera={{ latitude: 37.5665, longitude: 126.978, zoom: 12 }}
        isNightModeEnabled={true}
        lightness={0}
        isShowZoomControls={!pickingLocation}
        onCameraChanged={handleCameraChanged}
      >
        {userLocation && (
          <NaverMapMarkerOverlay
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
            anchor={{ x: 0.5, y: 0.5 }}
            width={40}
            height={40}
          >
            <UserLocationMarker />
          </NaverMapMarkerOverlay>
        )}

        {lights
          .filter((it) => it.isCluster)
          .map((item, idx) => (
            <NaverMapMarkerOverlay
              key={`server-cluster-${idx}-${item.count ?? 0}`}
              latitude={item.centerLatitude ?? item.latitude}
              longitude={item.centerLongitude ?? item.longitude}
              anchor={{ x: 0.5, y: 0.5 }}
              width={56}
              height={56}
              onTap={() => handleServerClusterTap(item)}
            >
              <ServerClusterMarker
                count={item.count ?? 0}
                category={item.category}
              />
            </NaverMapMarkerOverlay>
          ))}

        {frontClusters.map((cluster) =>
          cluster.items.length === 1 ? (
            <NaverMapMarkerOverlay
              key={`single-${cluster.items[0].passportId}`}
              latitude={cluster.centerLat}
              longitude={cluster.centerLng}
              anchor={{ x: 0.5, y: 0.5 }}
              width={56}
              height={56}
              onTap={() => handleFrontClusterTap(cluster)}
            >
              <PassportMarker
                spaceName={cluster.items[0].spaceName}
                category={cluster.items[0].category}
              />
            </NaverMapMarkerOverlay>
          ) : (
            <NaverMapMarkerOverlay
              key={`fc-${cluster.id}-${cluster.items.length}`}
              latitude={cluster.centerLat}
              longitude={cluster.centerLng}
              anchor={{ x: 0.5, y: 0.5 }}
              width={64}
              height={64}
              onTap={() => handleFrontClusterTap(cluster)}
            >
              <FrontClusterMarker
                count={cluster.items.length}
                category={dominantCategory(cluster.items)}
              />
            </NaverMapMarkerOverlay>
          ),
        )}
      </NaverMapView>

      {pickingLocation && <CenterPin />}

      {!pickingLocation && (
        <View style={[styles.bottomBar, { bottom: baseBottom }]}>
          <TouchableOpacity
            style={styles.locationButton}
            activeOpacity={0.8}
            onPress={handleLocationPress}
          >
            <CurrentLocationIcon width={26} height={26} stroke="#000000" />
          </TouchableOpacity>
          {showRegisterBtn && (
            <TouchableOpacity
              style={styles.registerButton}
              activeOpacity={0.85}
              onPress={handleRegisterPress}
            >
              <Text style={styles.registerButtonText}>
                나만의 장소 등록하기
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {pickingLocation && !showLocationConfirm && (
        <>
          <View style={[styles.pickingGuideWrapper, { top: safeTop + 10 }]}>
            <View style={styles.pickingGuideCard}>
              <Text style={styles.pickingGuideText}>
                지도를 움직여 핀을 원하는 위치에 맞추세요
              </Text>
            </View>
          </View>
          <View style={[styles.bottomBar, { bottom: baseBottom }]}>
            <TouchableOpacity
              style={styles.locationButton}
              activeOpacity={0.8}
              onPress={handleLocationPress}
            >
              <CurrentLocationIcon width={26} height={26} stroke="#000000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.registerButton}
              activeOpacity={0.85}
              onPress={handlePinLocation}
              disabled={addressLoading}
            >
              {addressLoading ? (
                <ActivityIndicator color={GREEN_MID} />
              ) : (
                <Text style={styles.registerButtonText}>이 위치로 고정</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.85}
              onPress={() => {
                setPickingLocation(false);
                setShowRegisterBtn(true);
              }}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {pickingLocation && showLocationConfirm && pickedLocation && (
        <View style={[styles.discoveryWrapper, { bottom: baseBottom + 60 }]}>
          <LocationConfirmCard
            latitude={pickedLocation.latitude}
            longitude={pickedLocation.longitude}
            address={pickedLocation.address}
            onConfirm={handleLocationConfirm}
            onCancel={handleLocationCancel}
          />
        </View>
      )}

      {previewVisible && !pickingLocation && (
        <View style={[styles.discoveryWrapper, { bottom: baseBottom + 60 }]}>
          <PassportPreviewCard
            preview={previewData}
            loading={previewLoading}
            error={previewError}
            onClose={() => {
              setPreviewVisible(false);
              setPreviewData(null);
            }}
            onOpenDetail={handleOpenDetail}
          />
        </View>
      )}

      {detailLoading && (
        <View style={styles.detailLoadingOverlay}>
          <ActivityIndicator size="large" color={GREEN_MID} />
        </View>
      )}

      {detailItem && (
        <View style={StyleSheet.absoluteFill}>
          <PassportDetail
            item={detailItem}
            editable={false}
            onBack={() => {
              setDetailItem(null);
              setPreviewVisible(true);
            }}
          />
        </View>
      )}

      {showAddPlace && (
        <View style={StyleSheet.absoluteFill}>
          <AddPlaceScreen
            initialLatitude={pickedLocation?.latitude}
            initialLongitude={pickedLocation?.longitude}
            initialAddress={pickedLocation?.address ?? undefined}
            onClose={() => {
              setShowAddPlace(false);
              setShowRegisterBtn(true);
              setPickingLocation(false);
              setPickedLocation(null);
              loadLights(INITIAL_BBOX);
            }}
          />
        </View>
      )}

      <ClusterBottomSheet
        items={activeClusterItems}
        onClose={() => setActiveClusterItems(null)}
        onSelectItem={handleSheetItemSelect}
      />
    </View>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  // 프리뷰 카드
  previewCard: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  previewCloseBtn: {
    position: "absolute",
    top: 12,
    right: 14,
    zIndex: 10,
    padding: 4,
  },
  previewCloseText: { fontSize: 16, color: "#94A3B8" },
  previewCenter: { paddingVertical: 32, alignItems: "center", gap: 8 },
  previewLoadingText: { fontSize: 13, color: "#94A3B8", marginTop: 6 },
  previewErrorText: { fontSize: 13, color: "#EF4444" },
  previewImage: { width: "100%", height: 160 },
  previewImagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImagePlaceholderText: { fontSize: 36 },
  previewBody: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 6,
  },
  previewNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  previewPlaceName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    flex: 1,
  },
  previewRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  previewRowIcon: { fontSize: 13 },
  previewRowText: { fontSize: 13, color: "#475569", flexShrink: 1 },
  previewDetailBtn: {
    marginTop: 12,
    backgroundColor: GREEN_MID,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  previewDetailBtnText: { color: "white", fontWeight: "700", fontSize: 14 },

  detailLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },

  // 핀
  centerPinWrapper: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -16,
    marginTop: -40,
    zIndex: 10,
  },
  centerPinEmoji: { fontSize: 36 },

  // 가이드
  pickingGuideWrapper: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 10,
  },
  pickingGuideCard: {
    backgroundColor: "rgba(16, 185, 129, 0.88)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  pickingGuideText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  cancelButton: {
    flex: 0.5,
    backgroundColor: "white",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  cancelButtonText: { fontSize: 15, fontWeight: "700", color: "#EF4444" },

  // 하단 바
  bottomBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  locationButtonIcon: { fontSize: 22, color: "#334155" },
  registerButton: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  registerButtonText: { fontSize: 15, fontWeight: "700", color: "#1E293B" },

  // 디스커버리/위치확인 카드
  discoveryWrapper: { position: "absolute", left: 16, right: 16 },
  discoveryCard: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  placeNameBar: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    alignItems: "center",
  },
  placeNameText: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  discoveryBody: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 6,
  },
  discoveryTitle: { fontSize: 17, fontWeight: "700", color: "#1E293B" },
  locationText: { fontSize: 13, color: "#64748B", textAlign: "center" },
  discoveryActions: { flexDirection: "row", gap: 10, width: "100%" },
  confirmButton: {
    flex: 1,
    backgroundColor: NAVY,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonText: { color: "white", fontWeight: "700", fontSize: 15 },
  dismissButton: {
    flex: 0.5,
    backgroundColor: "#F1F5F9",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  dismissButtonText: { color: "#475569", fontWeight: "600", fontSize: 15 },

  // 클러스터 바텀시트
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  sheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "65%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0FDF4",
  },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  sheetCloseText: { fontSize: 16, color: "#94A3B8", padding: 4 },
  sheetScroll: { flexGrow: 0 },
  sheetScrollContent: { paddingBottom: 32, paddingTop: 4 },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
    gap: 14,
  },
  sheetItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(156, 163, 175, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  sheetItemEmoji: { fontSize: 20 },
  sheetItemBody: { flex: 1 },
  sheetItemName: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  sheetItemSub: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  sheetItemChevron: { fontSize: 20, color: "#BBF7D0", fontWeight: "300" },
});
