import { getFriendLights } from "@/src/api/socialApi";
import {
    NaverMapMarkerOverlay,
    NaverMapView,
} from "@mj-studio/react-native-naver-map";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View
} from "react-native";
import { FriendLight } from "../types/social.types";

type MapPreviewProps = {
    userId: number;
}

const GREEN = "#34D399";
const GREEN_MID = "#059669";


type BBox = {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
};

const DEFAULT_CAMERA = {
    latitude: 37.5665,
    longitude: 126.9780,
    zoom: 10,
};

// 초기 화면 기준 BBox
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

function FriendLightMarker() {
    return (
        <View style={styles.lightMarkerWrapper}>
            <View style={styles.lightMarkerOuter}>
                <View style={styles.lightMarkerMiddle}>
                    <View style={styles.lightMarkerInner} />
                </View>
            </View>
        </View>
    );
}

function FriendClusterMarker({ count }: { count: number }) {
    return (
        <View style={styles.clusterMarkerWrapper}>
            <View style={styles.clusterMarkerOuter}>
                <View style={styles.clusterMarkerInner}>
                    <Text style={styles.clusterMarkerText}>{count}</Text>
                </View>
            </View>
        </View>
    );
}

export default function MapPreview({userId}: MapPreviewProps) {

    const [lights, setLights] = useState<FriendLight[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        loadLights(DEFAULT_BBOX);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [loadLights]);

    const handleCameraChanged = useCallback(
        (event: any) => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }

            debounceTimer.current = setTimeout(() => {
                const bbox = cameraToBBox(event);

                if (!bbox) return;

                setLoading(true);
                loadLights(bbox);
            }, 800);
        },
        [loadLights],
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
                camera= {DEFAULT_CAMERA}
                isNightModeEnabled={true}
                lightness={-0.2}
                isShowZoomControls={false}
                onCameraChanged={handleCameraChanged}
            >
                {lights.map((light, index) => {
                    const latitude = light.isCluster
                        ? light.centerLatitude
                        : light.latitude;

                    const longitude = light.isCluster
                        ? light.centerLongitude
                        : light.longitude;

                    return (
                            <NaverMapMarkerOverlay
                                key={`${light.passportId}-${index}-${latitude}-${longitude}`}
                                latitude={latitude}
                                longitude={longitude}
                                anchor={{ x: 0.5, y: 0.5 }}
                                width={light.isCluster ? 72 : 54}
                                height={light.isCluster ? 72 : 54}
                            >
                                {light.isCluster ? (
                                <FriendClusterMarker count={light.count ?? 0} />
                            ) : (
                                <FriendLightMarker />
                            )}
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
                    <Text style={styles.emptyOverlayText}>
                        {error}
                    </Text>
                </View>
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
    title: {
        fontSize: 15,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 6,
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
    lightMarkerWrapper: {
        width: 54,
        height: 54,
        alignItems: "center",
        justifyContent: "center",
    },
    lightMarkerOuter: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(52, 211, 153, 0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    lightMarkerMiddle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "rgba(52, 211, 153, 0.36)",
        alignItems: "center",
        justifyContent: "center",
    },
    lightMarkerInner: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: GREEN,
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },

    clusterMarkerWrapper: {
        width: 72,
        height: 72,
        alignItems: "center",
        justifyContent: "center",
    },
    clusterMarkerOuter: {
        width: 66,
        height: 66,
        borderRadius: 33,
        backgroundColor: "rgba(5, 150, 105, 0.22)",
        alignItems: "center",
        justifyContent: "center",
    },
    clusterMarkerInner: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: GREEN_MID,
        borderWidth: 3,
        borderColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },
    clusterMarkerText: {
        fontSize: 15,
        fontWeight: "800",
        color: "#FFFFFF",
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
    },
});