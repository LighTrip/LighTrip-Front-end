import { getPassportDetail } from "@/src/api/passport/passport.api";
import { getFriendLights } from "@/src/api/socialApi";
import {
    NaverMapMarkerOverlay,
    NaverMapView,
} from "@mj-studio/react-native-naver-map";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
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
import { FriendLight, FriendLightClusterItem } from "../types/social.types";

const CATEGORY_COLORS: Record<string, { main: string; light: string }> = {
    CAFE: { main: "#F59E0B", light: "#FDE68A" },
    RESTAURANT: { main: "#EF4444", light: "#FCA5A5" },
    BAR: { main: "#8B5CF6", light: "#C4B5FD" },
    CULTURE: { main: "#3B82F6", light: "#93C5FD" },
    ACTIVITY: { main: "#F97316", light: "#FDBA74" },
    SHOPPING: { main: "#EC4899", light: "#F9A8D4" },
    NATURE: { main: "#10B981", light: "#6EE7B7" },
    ETC: { main: "#6B7280", light: "#D1D5DB" },
};

const CATEGORY_PATHS: Record<string, string[]> = {
    CAFE:       ["M11 18C9.05 18 7.396 17.321 6.038 15.963C4.68 14.605 4.00067 12.9507 4 11V5C4 4.45 4.196 3.97933 4.588 3.588C4.98 3.19667 5.45067 3.00067 6 3H18.5C19.4667 3 20.2917 3.34167 20.975 4.025C21.6583 4.70833 22 5.53333 22 6.5C22 7.46667 21.6583 8.29167 20.975 8.975C20.2917 9.65833 19.4667 10 18.5 10H18V11C18 12.95 17.321 14.6043 15.963 15.963C14.605 17.3217 12.9507 18.0007 11 18ZM6 8H16V5H6V8ZM18 8H18.5C18.9167 8 19.271 7.85433 19.563 7.563C19.855 7.27167 20.0007 6.91733 20 6.5C19.9993 6.08267 19.8537 5.72867 19.563 5.438C19.2723 5.14733 18.918 5.00133 18.5 5H18V8ZM4 21V19H20V21H4Z"],
    RESTAURANT: ["M7 9V3C7 2.71667 7.096 2.47934 7.288 2.288C7.48 2.09667 7.71733 2.00067 8 2C8.28267 1.99934 8.52033 2.09534 8.713 2.288C8.90567 2.48067 9.00133 2.718 9 3V9H10V3C10 2.71667 10.096 2.47934 10.288 2.288C10.48 2.09667 10.7173 2.00067 11 2C11.2827 1.99934 11.5203 2.09534 11.713 2.288C11.9057 2.48067 12.0013 2.718 12 3V9C12 9.93334 11.7127 10.75 11.138 11.45C10.5633 12.15 9.85067 12.6167 9 12.85V21C9 21.2833 8.904 21.521 8.712 21.713C8.52 21.905 8.28267 22.0007 8 22C7.71733 21.9993 7.48 21.9033 7.288 21.712C7.096 21.5207 7 21.2833 7 21V12.85C6.15 12.6167 5.43767 12.15 4.863 11.45C4.28833 10.75 4.00067 9.93334 4 9V3C4 2.71667 4.096 2.47934 4.288 2.288C4.48 2.09667 4.71733 2.00067 5 2C5.28267 1.99934 5.52033 2.09534 5.713 2.288C5.90567 2.48067 6.00133 2.718 6 3V9H7ZM17 14H15C14.7167 14 14.4793 13.904 14.288 13.712C14.0967 13.52 14.0007 13.2827 14 13V7C14 5.83334 14.4293 4.70834 15.288 3.625C16.1467 2.54167 17.034 2 17.95 2C18.25 2 18.5 2.11667 18.7 2.35C18.9 2.58334 19 2.85834 19 3.175V21C19 21.2833 18.904 21.521 18.712 21.713C18.52 21.905 18.2827 22.0007 18 22C17.7173 21.9993 17.48 21.9033 17.288 21.712C17.096 21.5207 17 21.2833 17 21V14Z"],
    BAR:        ["M7.7998 2.3999C7.00416 2.3999 6.24109 2.71597 5.67848 3.27858C5.11588 3.84119 4.7998 4.60425 4.7998 5.3999V19.4999C4.7998 20.6591 5.7406 21.5999 6.8998 21.5999H15.8998C16.4568 21.5999 16.9909 21.3787 17.3847 20.9848C17.7786 20.591 17.9998 20.0569 17.9998 19.4999V17.9999H18.5998C19.3955 17.9999 20.1585 17.6838 20.7211 17.1212C21.2837 16.5586 21.5998 15.7956 21.5998 14.9999V8.9999C21.5998 8.20425 21.2837 7.44119 20.7211 6.87858C20.1585 6.31597 19.3955 5.9999 18.5998 5.9999H17.9998V5.3999C17.9998 4.60425 17.6837 3.84119 17.1211 3.27858C16.5585 2.71597 15.7955 2.3999 14.9998 2.3999H7.7998ZM17.9998 7.1999H18.5998C19.0772 7.1999 19.535 7.38954 19.8726 7.72711C20.2102 8.06468 20.3998 8.52251 20.3998 8.9999V14.9999C20.3998 15.4773 20.2102 15.9351 19.8726 16.2727C19.535 16.6103 19.0772 16.7999 18.5998 16.7999H17.9998V7.1999ZM5.9998 5.3999C5.9998 4.92251 6.18945 4.46468 6.52701 4.12711C6.86458 3.78954 7.32241 3.5999 7.7998 3.5999H14.9998C15.4772 3.5999 15.935 3.78954 16.2726 4.12711C16.6102 4.46468 16.7998 4.92251 16.7998 5.3999V5.9999H5.9998V5.3999ZM14.9998 9.5999V16.7999C14.9998 16.959 14.9366 17.1116 14.8241 17.2242C14.7115 17.3367 14.5589 17.3999 14.3998 17.3999C14.2407 17.3999 14.0881 17.3367 13.9755 17.2242C13.863 17.1116 13.7998 16.959 13.7998 16.7999V9.5999C13.7998 9.44077 13.863 9.28816 13.9755 9.17564C14.0881 9.06312 14.2407 8.9999 14.3998 8.9999C14.5589 8.9999 14.7115 9.06312 14.8241 9.17564C14.9366 9.28816 14.9998 9.44077 14.9998 9.5999ZM11.3998 8.9999C11.5589 8.9999 11.7115 9.06312 11.8241 9.17564C11.9366 9.28816 11.9998 9.44077 11.9998 9.5999V16.7999C11.9998 16.959 11.9366 17.1116 11.8241 17.2242C11.7115 17.3367 11.5589 17.3999 11.3998 17.3999C11.2407 17.3999 11.0881 17.3367 10.9755 17.2242C10.863 17.1116 10.7998 16.959 10.7998 16.7999V9.5999C10.7998 9.44077 10.863 9.28816 10.9755 9.17564C11.0881 9.06312 11.2407 8.9999 11.3998 8.9999ZM8.9998 9.5999V16.7999C8.9998 16.959 8.93659 17.1116 8.82407 17.2242C8.71155 17.3367 8.55893 17.3999 8.3998 17.3999C8.24067 17.3999 8.08806 17.3367 7.97554 17.2242C7.86302 17.1116 7.7998 16.959 7.7998 16.7999V9.5999C7.7998 9.44077 7.86302 9.28816 7.97554 9.17564C8.08806 9.06312 8.24067 8.9999 8.3998 8.9999C8.55893 8.9999 8.71155 9.06312 8.82407 9.17564C8.93659 9.28816 8.9998 9.44077 8.9998 9.5999Z"],
    CULTURE:    ["M20 3H4C2.897 3 2 3.897 2 5V19C2 20.103 2.897 21 4 21H20C21.103 21 22 20.103 22 19V5C22 3.897 21.103 3 20 3ZM20.001 9C19.9997 9 19.9997 9 20.001 9H19.535L16.868 5H20L20.001 9ZM14.535 9L11.868 5H14.464L17.131 9H14.535ZM12.131 9H9.535L6.869 5H9.465L12.131 9ZM4 5H4.465L7.132 9H4V5Z"],
    ACTIVITY:   ["M20.9754 9.02508L14.9254 2.97508L15.3504 2.55008C15.7337 2.16675 16.2087 1.97941 16.7754 1.98808C17.3421 1.99675 17.8171 2.19241 18.2004 2.57508L21.4254 5.80008C21.8087 6.18341 22.0004 6.65441 22.0004 7.21308C22.0004 7.77175 21.8087 8.24241 21.4254 8.62508L20.9754 9.02508ZM8.65039 21.4001C8.26706 21.7834 7.79639 21.9751 7.23839 21.9751C6.68039 21.9751 6.20939 21.7834 5.82539 21.4001L2.60039 18.1751C2.21706 17.7917 2.02539 17.3211 2.02539 16.7631C2.02539 16.2051 2.21706 15.7341 2.60039 15.3501L3.00039 14.9501L9.05039 21.0001L8.65039 21.4001ZM12.2754 20.7001C12.0754 20.9001 11.8421 21.0001 11.5754 21.0001C11.3087 21.0001 11.0754 20.9001 10.8754 20.7001L3.30039 13.1251C3.10039 12.9251 3.00039 12.6917 3.00039 12.4251C3.00039 12.1584 3.10039 11.9251 3.30039 11.7251L4.72539 10.2751C4.92539 10.0751 5.16306 9.97508 5.43839 9.97508C5.71372 9.97508 5.95106 10.0751 6.15039 10.2751L7.72539 11.8501L11.8754 7.70008L10.3004 6.12508C10.1004 5.92508 10.0004 5.69175 10.0004 5.42508C10.0004 5.15841 10.1004 4.92508 10.3004 4.72508L11.7254 3.27508C11.9254 3.07508 12.1631 2.97508 12.4384 2.97508C12.7137 2.97508 12.9511 3.07508 13.1504 3.27508L20.7254 10.8501C20.9254 11.0501 21.0254 11.2877 21.0254 11.5631C21.0254 11.8384 20.9254 12.0757 20.7254 12.2751L19.2754 13.7001C19.0754 13.9001 18.8421 14.0001 18.5754 14.0001C18.3087 14.0001 18.0754 13.9001 17.8754 13.7001L16.3004 12.1251L12.1504 16.2751L13.7254 17.8501C13.9254 18.0501 14.0254 18.2874 14.0254 18.5621C14.0254 18.8367 13.9254 19.0744 13.7254 19.2751L12.2754 20.7001Z"],
    SHOPPING:   ["M19.5 16H6.5L4 6H22L19.5 16Z","M1.5 3H3.25L4 6M4 6L6.5 16H19.5L22 6H4Z","M6.5 21C7.32843 21 8 20.3284 8 19.5C8 18.6716 7.32843 18 6.5 18C5.67157 18 5 18.6716 5 19.5C5 20.3284 5.67157 21 6.5 21Z","M19.5 21C20.3284 21 21 20.3284 21 19.5C21 18.6716 20.3284 18 19.5 18C18.6716 18 18 18.6716 18 19.5C18 20.3284 18.6716 21 19.5 21Z"],
    NATURE:     ["M10.0504 18H4.87538C4.47538 18 4.17538 17.825 3.97538 17.475C3.77538 17.125 3.79204 16.7833 4.02538 16.45L7.00038 12H6.92538C6.52538 12 6.22938 11.821 6.03738 11.463C5.84538 11.105 5.86638 10.759 6.10038 10.425L11.1754 3.17501C11.2754 3.04168 11.4004 2.93768 11.5504 2.86301C11.7004 2.78834 11.8504 2.75068 12.0004 2.75001C12.1504 2.74934 12.3004 2.78701 12.4504 2.86301C12.6004 2.93901 12.7254 3.04301 12.8254 3.17501L17.9004 10.425C18.1337 10.7583 18.1547 11.1043 17.9634 11.463C17.772 11.8217 17.476 12.0007 17.0754 12H17.0004L19.9754 16.45C20.2087 16.7833 20.2254 17.125 20.0254 17.475C19.8254 17.825 19.5254 18 19.1254 18H13.9504V21C13.9504 21.2833 13.8547 21.521 13.6634 21.713C13.472 21.905 13.2344 22.0007 12.9504 22H11.0504C10.767 22 10.5297 21.904 10.3384 21.712C10.147 21.52 10.051 21.2827 10.0504 21V18Z"],
    ETC:        ["M17.578 4.432L15.578 3.382C13.822 2.461 12.944 2 12 2C11.056 2 10.178 2.46 8.422 3.382L8.101 3.551L17.024 8.65L21.04 6.64C20.394 5.908 19.352 5.361 17.578 4.43M21.748 7.964L17.75 9.964V13C17.75 13.1989 17.671 13.3897 17.5303 13.5303C17.3897 13.671 17.1989 13.75 17 13.75C16.8011 13.75 16.6103 13.671 16.4697 13.5303C16.329 13.3897 16.25 13.1989 16.25 13V10.714L12.75 12.464V21.904C13.468 21.725 14.285 21.297 15.578 20.618L17.578 19.568C19.729 18.439 20.805 17.875 21.403 16.86C22 15.846 22 14.583 22 12.06V11.943C22 10.05 22 8.866 21.748 7.964ZM11.25 21.904V12.464L2.252 7.964C2 8.866 2 10.05 2 11.941V12.058C2 14.583 2 15.846 2.597 16.86C3.195 17.875 4.271 18.44 6.422 19.569L8.422 20.618C9.715 21.297 10.532 21.725 11.25 21.904ZM2.96 6.641L12 11.161L15.411 9.456L6.525 4.378L6.422 4.432C4.649 5.362 3.606 5.909 2.96 6.642"],
};

type MapPreviewProps = {
    userId: number;
    refreshVersion: number;
};

type BBox = {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
};

type FrontCluster = {
    id: string;
    centerLat: number;
    centerLng: number;
    items: FriendLight[];
};

type LightInfoItem = FriendLightClusterItem & {
    createdAt?: string;
};

const NAVY = "#0F2744";
const GREEN = "#34D399";
const GREEN_MID = "#059669";

const DEFAULT_CAMERA = {
    latitude: 37.5665,
    longitude: 126.9780,
    zoom: 10,
};

const DEFAULT_BBOX: BBox = {
    minLat: 37.4133,
    maxLat: 37.7151,
    minLng: 126.7341,
    maxLng: 127.2693,
};

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

    if (typeof lat !== "number" || typeof lng !== "number") {
        return null;
    }

    const delta = 0.05;

    return {
        minLat: lat - delta,
        maxLat: lat + delta,
        minLng: lng - delta,
        maxLng: lng + delta,
    };
}

function clusterRadiusFromBBox(bbox: BBox | null): number {
    if (!bbox) return 0.01;

    const latSpan = bbox.maxLat - bbox.minLat;
    const lngSpan = bbox.maxLng - bbox.minLng;
    const diagonal = Math.sqrt(latSpan * latSpan + lngSpan * lngSpan);

    return Math.max(0.000003, diagonal * 0.08);
}

function clusterSingleMarkers(
    items: FriendLight[],
    bbox: BBox | null,
): FrontCluster[] {
    const radius = clusterRadiusFromBBox(bbox);
    const singles = items.filter((item) => !item.isCluster);
    const assigned = new Array(singles.length).fill(false);
    const clusters: FrontCluster[] = [];

    singles.forEach((item, i) => {
        if (assigned[i]) return;

        const group: FriendLight[] = [item];
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

        const centerLat =
            group.reduce((sum, light) => sum + light.latitude, 0) /
            group.length;

        const centerLng =
            group.reduce((sum, light) => sum + light.longitude, 0) /
            group.length;

        clusters.push({
            id: `friend-front-cluster-${i}`,
            centerLat,
            centerLng,
            items: group,
        });
    });

    return clusters;
}

function PassportMarker({
    category,
}: {
    spaceName: string;
    category: string;
}) {
    const { main, light } = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.ETC;
    const paths = CATEGORY_PATHS[category] ?? CATEGORY_PATHS.ETC;

    const scale = 18 / 24;
    const offset = 28 - 9;
    const gradOut = `pm_o_${category}`;
    const gradIn = `pm_i_${category}`;

    return (
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
    );
}

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

function ServerClusterMarker({
    count,
    category,
}: {
    count: number;
    category: string;
}) {
    const { main, light } = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.ETC;

    return (
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
    );
}

function FrontClusterMarker({
    count,
    category,
}: {
    count: number;
    category: string;
}) {
    const { main, light } = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.ETC;

    return (
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
    );
}

function dominantCategory(items: { category: string }[]): string {
    const freq: Record<string, number> = {};

    for (const { category } of items) {
        freq[category] = (freq[category] ?? 0) + 1;
    }

    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "ETC";
}

const mapLightToClusterItem = (light: FriendLight): FriendLightClusterItem => ({
    passportId: light.passportId,
    thumbnailUrl: light.thumbnailUrl,
    spaceName: light.spaceName,
    districtCategory: light.districtCategory,
    districtDisplayName: light.districtCategory,
    category: light.category,
    categoryDisplayName: light.category,
    visitedAt: light.visitedAt,
    visibility: "PUBLIC",
    likeCount: light.likeCount,
    scrapCount: light.scrapCount,
    theme: "",
});

const distanceFromCenter = (
    light: FriendLight,
    centerLat: number,
    centerLng: number,
) => {
    const dlat = light.latitude - centerLat;
    const dlng = light.longitude - centerLng;

    return dlat * dlat + dlng * dlng;
};

const mapLightsToClusterItems = (
    friendLights: FriendLight[],
    centerLat: number,
    centerLng: number,
    expectedCount: number,
) => {
    const singleLights = friendLights.filter((light) => !light.isCluster);
    const sortedLights = [...singleLights].sort(
        (a, b) =>
            distanceFromCenter(a, centerLat, centerLng) -
            distanceFromCenter(b, centerLat, centerLng)
    );

    const selectedLights =
        expectedCount > 0 && sortedLights.length > expectedCount
            ? sortedLights.slice(0, expectedCount)
            : sortedLights;

    return selectedLights.map(mapLightToClusterItem);
};

const formatDate = (dateText?: string) => {
    if (!dateText) return "";

    const date = new Date(dateText);

    if (Number.isNaN(date.getTime())) {
        return dateText.slice(0, 10);
    }

    return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

function LightInfoCard({
    item,
    onClose,
}: {
    item: LightInfoItem;
    onClose: () => void;
}) {
    return (
        <View style={styles.infoCard}>
            <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={10}
            >
                <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>

            <View style={styles.infoContent}>
                {item.thumbnailUrl ? (
                    <Image
                        source={{ uri: item.thumbnailUrl }}
                        style={styles.infoImage}
                    />
                ) : (
                    <View style={styles.infoImagePlaceholder}>
                        <Text style={styles.infoImagePlaceholderText}>
                            {item.categoryDisplayName?.slice(0, 1) || item.category.slice(0, 1)}
                        </Text>
                    </View>
                )}

                <View style={styles.infoTextBox}>
                    <Text style={styles.infoTitle} numberOfLines={1}>
                        {item.spaceName}
                    </Text>
                    <Text style={styles.infoMeta} numberOfLines={1}>
                        {item.districtDisplayName || item.districtCategory}
                        {item.categoryDisplayName ? ` · ${item.categoryDisplayName}` : ""}
                    </Text>
                    <Text style={styles.infoMeta}>
                        {formatDate(item.createdAt ?? item.visitedAt)}
                    </Text>
                    <Text style={styles.infoStats}>
                        좋아요 {item.likeCount ?? 0} · 스크랩 {item.scrapCount ?? 0}
                    </Text>
                </View>
            </View>
        </View>
    );
}

function ClusterListSheet({
    items,
    loading,
    error,
    onClose,
    onSelect,
}: {
    items: FriendLightClusterItem[] | null;
    loading: boolean;
    error: string | null;
    onClose: () => void;
    onSelect: (item: FriendLightClusterItem) => void;
}) {
    return (
        <View style={styles.clusterSheet}>
            <View style={styles.clusterSheetHeader}>
                <Text style={styles.clusterSheetTitle}>이 위치의 불빛</Text>
                <TouchableOpacity onPress={onClose} hitSlop={10}>
                    <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.clusterStateBox}>
                    <ActivityIndicator color="#1A3A6B" />
                    <Text style={styles.clusterStateText}>불빛 정보를 불러오는 중...</Text>
                </View>
            ) : error ? (
                <View style={styles.clusterStateBox}>
                    <Text style={styles.clusterStateText}>{error}</Text>
                </View>
            ) : !items || items.length === 0 ? (
                <View style={styles.clusterStateBox}>
                    <Text style={styles.clusterStateText}>표시할 불빛이 없습니다.</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.clusterList}
                    showsVerticalScrollIndicator={false}
                >
                    {items.map((item) => (
                        <TouchableOpacity
                            key={item.passportId}
                            style={styles.clusterItem}
                            activeOpacity={0.8}
                            onPress={() => onSelect(item)}
                        >
                            {item.thumbnailUrl ? (
                                <Image
                                    source={{ uri: item.thumbnailUrl }}
                                    style={styles.clusterItemImage}
                                />
                            ) : (
                                <View style={styles.clusterItemImagePlaceholder}>
                                    <Text style={styles.clusterItemImageText}>
                                        {item.categoryDisplayName?.slice(0, 1) || item.category.slice(0, 1)}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.clusterItemTextBox}>
                                <Text style={styles.clusterItemTitle} numberOfLines={1}>
                                    {item.spaceName}
                                </Text>
                                <Text style={styles.clusterItemMeta} numberOfLines={1}>
                                    {item.districtDisplayName || item.districtCategory}
                                    {item.categoryDisplayName ? ` · ${item.categoryDisplayName}` : ""}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

export default function MapPreview({ userId, refreshVersion }: MapPreviewProps) {
    const [lights, setLights] = useState<FriendLight[]>([]);
    const [currentBBox, setCurrentBBox] = useState<BBox | null>(DEFAULT_BBOX);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLight, setSelectedLight] = useState<LightInfoItem | null>(null);
    const [clusterItems, setClusterItems] = useState<FriendLightClusterItem[] | null>(null);
    const [clusterLoading, setClusterLoading] = useState(false);
    const [clusterError, setClusterError] = useState<string | null>(null);

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const frontClusters = clusterSingleMarkers(lights, currentBBox);

    const closeOverlays = useCallback(() => {
        setSelectedLight(null);
        setClusterItems(null);
        setClusterError(null);
    }, []);

    const loadLights = useCallback(
        async (bbox: BBox) => {
            try {
                setError(null);

                const data = await getFriendLights(
                    userId,
                    bbox.minLat,
                    bbox.maxLat,
                    bbox.minLng,
                    bbox.maxLng,
                );

                console.log(
                    `[친구 불빛 BBox] minLat=${bbox.minLat}, maxLat=${bbox.maxLat}, minLng=${bbox.minLng}, maxLng=${bbox.maxLng}`,
                );
                console.log("친구 불빛 개수:", data.length);

                setLights(data);
            } catch (err: any) {
                console.log("친구 불빛 조회 실패:", err);
                setError(err.message || "친구 불빛을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
                setInitialLoading(false);
            }
        },
        [userId],
    );

    useEffect(() => {
        setInitialLoading(true);
        setLoading(true);
        setCurrentBBox(DEFAULT_BBOX);
        loadLights(DEFAULT_BBOX);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [loadLights, refreshVersion]);

    const handleCameraChanged = useCallback(
        (event: any) => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }

            debounceTimer.current = setTimeout(() => {
                const bbox = cameraToBBox(event);

                if (!bbox) return;

                setCurrentBBox(bbox);
                setLoading(true);
                closeOverlays();
                loadLights(bbox);
            }, 800);
        },
        [closeOverlays, loadLights],
    );

    const fetchLightDetail = useCallback(async (
        item: FriendLightClusterItem,
    ): Promise<LightInfoItem> => {
        const response = await getPassportDetail(item.passportId);
        const detail = response.data.data;

        return {
            ...item,
            thumbnailUrl: detail.imageUrls?.[0] ?? item.thumbnailUrl,
            spaceName: detail.spaceName ?? item.spaceName,
            districtCategory: detail.districtCategory ?? item.districtCategory,
            districtDisplayName: detail.district ?? item.districtDisplayName,
            category: detail.category ?? item.category,
            categoryDisplayName: detail.category ?? item.categoryDisplayName,
            visitedAt: detail.visitedAt ?? item.visitedAt,
            likeCount: detail.likeCount ?? item.likeCount,
            scrapCount: detail.scrapCount ?? item.scrapCount,
            createdAt: detail.createdAt,
        };
    }, []);

    const showLightInfo = useCallback(async (item: FriendLightClusterItem) => {
        setClusterItems(null);
        setClusterError(null);

        const fallbackItem = item;
        setSelectedLight(fallbackItem);

        try {
            const detailItem = await fetchLightDetail(fallbackItem);
            setSelectedLight(detailItem);
        } catch (err) {
            console.log("친구 여권 상세 조회 실패:", err);
        }
    }, [fetchLightDetail]);

    const handleSingleMarkerTap = useCallback((light: FriendLight) => {
        showLightInfo(mapLightToClusterItem(light));
    }, [showLightInfo]);

    const fetchFriendClusterItems = useCallback(
        async (
            centerLat: number,
            centerLng: number,
            expectedCount: number,
        ) => {
            try {
                setClusterLoading(true);
                setClusterError(null);
                setSelectedLight(null);

                const viewLatSpan = currentBBox ? currentBBox.maxLat - currentBBox.minLat : 0.1;
                const viewLngSpan = currentBBox ? currentBBox.maxLng - currentBBox.minLng : 0.1;
                const divisors = [40, 24, 16, 10, 8, 6, 4, 2, 1];
                const collectedLights = new Map<number, FriendLight>();
                const nestedClusters: FriendLight[] = [];

                const collectLights = (items: FriendLight[]) => {
                    items.forEach((item) => {
                        if (item.isCluster) {
                            nestedClusters.push(item);
                            return;
                        }

                        collectedLights.set(item.passportId, item);
                    });
                };

                const fetchAroundCenter = async (
                    lat: number,
                    lng: number,
                    divisor: number,
                ) => {
                    const halfLat = viewLatSpan / divisor / 2;
                    const halfLng = viewLngSpan / divisor / 2;

                    const data = await getFriendLights(
                        userId,
                        lat - halfLat,
                        lat + halfLat,
                        lng - halfLng,
                        lng + halfLng,
                    );

                    collectLights(data);
                };

                for (const divisor of divisors) {
                    await fetchAroundCenter(centerLat, centerLng, divisor);

                    if (
                        expectedCount > 0 &&
                        collectedLights.size >= expectedCount
                    ) {
                        break;
                    }
                }

                if (
                    expectedCount > 0 &&
                    collectedLights.size < expectedCount &&
                    nestedClusters.length > 0
                ) {
                    const sortedNestedClusters = [...nestedClusters].sort(
                        (a, b) =>
                            distanceFromCenter(
                                a,
                                centerLat,
                                centerLng,
                            ) -
                            distanceFromCenter(
                                b,
                                centerLat,
                                centerLng,
                            )
                    );

                    for (const cluster of sortedNestedClusters) {
                        const clusterLat =
                            cluster.centerLatitude ?? cluster.latitude;
                        const clusterLng =
                            cluster.centerLongitude ?? cluster.longitude;

                        for (const divisor of divisors) {
                            await fetchAroundCenter(
                                clusterLat,
                                clusterLng,
                                divisor,
                            );

                            if (collectedLights.size >= expectedCount) {
                                break;
                            }
                        }

                        if (collectedLights.size >= expectedCount) {
                            break;
                        }
                    }
                }

                setClusterItems(
                    mapLightsToClusterItems(
                        [...collectedLights.values()],
                        centerLat,
                        centerLng,
                        expectedCount
                    )
                );
            } catch (err: any) {
                console.log("친구 지도 클러스터 상세 조회 실패:", err);
                setClusterItems([]);
                setClusterError(err.message || "클러스터 정보를 불러오지 못했습니다.");
            } finally {
                setClusterLoading(false);
            }
        },
        [currentBBox, userId],
    );

    const handleServerClusterTap = useCallback(
        (light: FriendLight) => {
            const lat = light.centerLatitude ?? light.latitude;
            const lng = light.centerLongitude ?? light.longitude;
            const expectedCount = light.count ?? 0;

            fetchFriendClusterItems(lat, lng, expectedCount);
        },
        [fetchFriendClusterItems],
    );

    const handleFrontClusterTap = useCallback(
        (cluster: FrontCluster) => {
            if (cluster.items.length === 1) {
                handleSingleMarkerTap(cluster.items[0]);
                return;
            }

            setSelectedLight(null);
            setClusterError(null);
            setClusterItems(
                cluster.items
                    .filter((light) => !light.isCluster)
                    .map(mapLightToClusterItem)
            );
        },
        [handleSingleMarkerTap],
    );

    if (initialLoading) {
        return (
            <View style={styles.emptyBox}>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.description}>
                    친구 지도를 불러오는 중...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.mapBox}>
            <NaverMapView
                style={styles.map}
                camera={DEFAULT_CAMERA}
                isNightModeEnabled={true}
                lightness={-0.2}
                isShowZoomControls={false}
                onCameraChanged={handleCameraChanged}
            >
                {lights
                    .filter((light) => light.isCluster)
                    .map((light, index) => (
                        <NaverMapMarkerOverlay
                            key={`server-cluster-${index}`}
                            latitude={light.centerLatitude ?? light.latitude}
                            longitude={light.centerLongitude ?? light.longitude}
                            anchor={{ x: 0.5, y: 0.5 }}
                            width={56}
                            height={56}
                            onTap={() => handleServerClusterTap(light)}
                        >
                            <ServerClusterMarker
                                count={light.count ?? 0}
                                category={light.category ?? "ETC"}
                            />
                        </NaverMapMarkerOverlay>
                ))}

                {frontClusters.map((cluster) => {
                    const category = dominantCategory(cluster.items);

                    return cluster.items.length === 1 ? (
                        <NaverMapMarkerOverlay
                            key={cluster.id}
                            latitude={cluster.centerLat}
                            longitude={cluster.centerLng}
                            anchor={{ x: 0.5, y: 0.5 }}
                            width={56}
                            height={56}
                            onTap={() => handleSingleMarkerTap(cluster.items[0])}
                        >
                            <PassportMarker
                                spaceName={cluster.items[0].spaceName}
                                category={cluster.items[0].category}
                            />
                        </NaverMapMarkerOverlay>
                    ) : (
                        <NaverMapMarkerOverlay
                            key={cluster.id}
                            latitude={cluster.centerLat}
                            longitude={cluster.centerLng}
                            anchor={{ x: 0.5, y: 0.5 }}
                            width={64}
                            height={64}
                            onTap={() => handleFrontClusterTap(cluster)}
                        >
                            <FrontClusterMarker
                                count={cluster.items.length}
                                category={category}
                            />
                        </NaverMapMarkerOverlay>
                    );
                })}
            </NaverMapView>

            {!loading && lights.length === 0 && !error && (
                <View style={styles.emptyOverlay}>
                    <Text style={styles.emptyOverlayText}>
                        현재 지도 범위에 공개 여권이 없어요.
                    </Text>
                </View>
            )}

            {error && (
                <View style={styles.emptyOverlay}>
                    <Text style={styles.emptyOverlayText}>{error}</Text>
                </View>
            )}

            {selectedLight && (
                <LightInfoCard
                    item={selectedLight}
                    onClose={() => setSelectedLight(null)}
                />
            )}

            {(clusterItems || clusterLoading || clusterError) && (
                <ClusterListSheet
                    items={clusterItems}
                    loading={clusterLoading}
                    error={clusterError}
                    onClose={closeOverlays}
                    onSelect={showLightInfo}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    emptyBox: {
        height: 180,
        borderRadius: 12,
        backgroundColor: "#101B33",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    description: {
        fontSize: 12,
        color: "#C7CEDA",
        textAlign: "center",
        lineHeight: 18,
        marginTop: 8,
    },
    mapBox: {
        height: 380,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#101B33",
    },
    map: {
        flex: 1,
    },

    passportMarkerWrapper: {
        alignItems: "center",
    },
    passportMarkerBubble: {
        flexDirection: "row",
        alignItems: "center",
        maxWidth: 130,
        height: 42,
        paddingHorizontal: 10,
        borderRadius: 21,
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: GREEN,
    },
    passportMarkerIconCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "#D1FAE5",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 6,
    },
    passportMarkerEmoji: {
        fontSize: 14,
    },
    passportMarkerLabel: {
        flexShrink: 1,
        fontSize: 12,
        fontWeight: "700",
        color: NAVY,
    },
    passportMarkerTail: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: GREEN,
        marginTop: -1,
    },

    clusterWrapper: {
        alignItems: "center",
    },
    clusterBubble: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: GREEN_MID,
        borderWidth: 3,
        borderColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },
    clusterCount: {
        fontSize: 15,
        fontWeight: "800",
        color: "#FFFFFF",
    },
    clusterTail: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: GREEN_MID,
        marginTop: -1,
    },

    frontClusterWrapper: {
        alignItems: "center",
    },
    frontClusterOuter: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: "rgba(52, 211, 153, 0.22)",
        alignItems: "center",
        justifyContent: "center",
    },
    frontClusterInner: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: GREEN,
        borderWidth: 3,
        borderColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },
    frontClusterCount: {
        fontSize: 14,
        fontWeight: "800",
        color: "#FFFFFF",
    },
    frontClusterTail: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: GREEN,
        marginTop: -2,
    },

    infoCard: {
        position: "absolute",
        left: 14,
        right: 14,
        bottom: 14,
        borderRadius: 14,
        backgroundColor: "#FFFFFF",
        padding: 12,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 8,
    },
    closeButton: {
        position: "absolute",
        top: 8,
        right: 10,
        zIndex: 2,
    },
    closeButtonText: {
        fontSize: 22,
        lineHeight: 24,
        color: "#64748B",
        fontWeight: "700",
    },
    infoContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingRight: 18,
    },
    infoImage: {
        width: 64,
        height: 64,
        borderRadius: 12,
        marginRight: 12,
        backgroundColor: "#E5E7EB",
    },
    infoImagePlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 12,
        marginRight: 12,
        backgroundColor: "#E0F2FE",
        alignItems: "center",
        justifyContent: "center",
    },
    infoImagePlaceholderText: {
        fontSize: 20,
        fontWeight: "800",
        color: "#1A3A6B",
    },
    infoTextBox: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 4,
    },
    infoMeta: {
        fontSize: 12,
        color: "#64748B",
        marginBottom: 2,
    },
    infoStats: {
        marginTop: 3,
        fontSize: 12,
        color: "#1A3A6B",
        fontWeight: "700",
    },
    clusterSheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        maxHeight: 250,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 14,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 10,
    },
    clusterSheetHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    clusterSheetTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#111827",
    },
    clusterStateBox: {
        minHeight: 90,
        alignItems: "center",
        justifyContent: "center",
    },
    clusterStateText: {
        marginTop: 8,
        fontSize: 12,
        color: "#64748B",
        textAlign: "center",
    },
    clusterList: {
        maxHeight: 190,
    },
    clusterItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#EEF2F7",
    },
    clusterItemImage: {
        width: 46,
        height: 46,
        borderRadius: 10,
        marginRight: 10,
        backgroundColor: "#E5E7EB",
    },
    clusterItemImagePlaceholder: {
        width: 46,
        height: 46,
        borderRadius: 10,
        marginRight: 10,
        backgroundColor: "#E0F2FE",
        alignItems: "center",
        justifyContent: "center",
    },
    clusterItemImageText: {
        fontSize: 16,
        fontWeight: "800",
        color: "#1A3A6B",
    },
    clusterItemTextBox: {
        flex: 1,
    },
    clusterItemTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 3,
    },
    clusterItemMeta: {
        fontSize: 12,
        color: "#64748B",
    },

    emptyOverlay: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 16,
        backgroundColor: "rgba(16, 27, 51, 0.86)",
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        alignItems: "center",
    },
    emptyOverlayText: {
        fontSize: 12,
        color: "#FFFFFF",
        fontWeight: "600",
        textAlign: "center",
    },
});
