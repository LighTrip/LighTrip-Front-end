import { getFriendMap } from "@/src/api/socialApi";
import {
    NaverMapMarkerOverlay,
    NaverMapView,
} from "@mj-studio/react-native-naver-map";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View
} from "react-native";
import { DISTRICT_COORDS } from "../data/districtCoords";
import { FriendMapDistrict } from "../types/social.types";

type MapPreviewProps = {
    userId: number;
}

export default function MapPreview({userId}: MapPreviewProps) {

    const [districts, setDistricts] = useState<FriendMapDistrict[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const markerDistricts = useMemo(() =>{
        return districts
            .map((district) => {
                const coord = DISTRICT_COORDS[district.districtCategory];

                if(!coord) {
                    console.log("좌표 매핑 실패:", district.districtCategory)
                    return null;
                }

                return {
                    ...district,
                    latitude: coord.latitude,
                    longitude: coord.longitude,
                };
            })
            .filter((item): item is FriendMapDistrict & {
                latitude: number;
                longitude: number;
            }=> item !== null);
    }, [districts]);

    useEffect(() => {
        const fetchMapData = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await getFriendMap(userId);
                setDistricts(data);
            }catch(err: any) {
                console.log("친구 지도 조회 실패:", err);
                setError(err.message || "친구 지도를 불러오지 못했습니다.");
            }finally {
                setLoading(false);
            }
        }
        fetchMapData();
    }, [userId]);

    if (loading) {
        return (
            <View style={styles.emptyBox}>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.description}>친구 지도를 불러오는 중...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.emptyBox}>
                <Text style={styles.title}>지도 조회 실패</Text>
                <Text style={styles.description}>{error}</Text>
            </View>
        );
    }

    if (districts.length === 0) {
        return (
            <View style={styles.emptyBox}>
                <Text style={styles.title}>방문한 지역이 없어요</Text>
                <Text style={styles.description}>
                    친구가 아직 공개 여권으로 방문한 지역이 없습니다.
                </Text>
            </View>
        );
    }

    if (markerDistricts.length === 0) {
        return (
            <View style={styles.emptyBox}>
                <Text style={styles.title}>좌표를 찾을 수 없어요</Text>
                <Text style={styles.description}>
                    방문 지역 데이터는 있지만, 프론트 좌표 매핑에 없는 지역입니다.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.mapBox}>
            <NaverMapView
                style={styles.map}
                camera={{
                    latitude: 37.5665,
                    longitude: 126.9780,
                    zoom: 10,
                }}
            >
                {markerDistricts.map((district) => (
                    <NaverMapMarkerOverlay
                        key={district.districtCategory}
                        latitude={district.latitude}
                        longitude={district.longitude}
                        caption={{
                            text: `${district.displayName} ${district.passportCount}개`,
                        }}
                    />
                ))}
            </NaverMapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 4,
    },
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
    districtCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#101B33",
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
    },
    thumbnail: {
        width: 56,
        height: 56,
        borderRadius: 12,
        marginRight: 12,
    },
    thumbnailPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: "#263B63",
        marginRight: 12,
    },
    textArea: {
        flex: 1,
    },
    districtName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    passportCount: {
        fontSize: 13,
        color: "#C7CEDA",
    },
    mapBox: {
        height: 300,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#101B33",
    },
    map: {
        flex: 1,
    },
});