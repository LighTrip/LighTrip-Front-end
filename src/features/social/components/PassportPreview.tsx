import { getFriendMap } from "@/src/api/socialApi";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { FriendMapDistrict } from "../types/social.types";

type PassportPreviewProps = {
    userId: number;
    refreshVersion: number;
    onLatestDistrictChange?: (district: string | null) => void;
}

const defaultPassportImage = require("../../../../assets/images/default_profile.png");

export default function PassportPreview(
    {
        userId,
        refreshVersion,
        onLatestDistrictChange,
    }: PassportPreviewProps) {

    const [districts, setDistricts] = useState<FriendMapDistrict[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // 친구 여권 목록 조회 호출
    const fetchFriendMapDistricts = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const data = await getFriendMap(userId);

            console.log("친구 방문 지역 목록 data:", data);

            setDistricts(data);

            const latestDistrictName = data[0]?.displayName ?? null;
            onLatestDistrictChange?.(latestDistrictName);
        } catch (error) {
            console.log("친구 방문 지역 목록 조회 에러:", error);
            setErrorMessage("친구의 여권 목록을 불러오지 못했습니다.");
            onLatestDistrictChange?.(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFriendMapDistricts();
    }, [userId, refreshVersion]);

    if (loading) {
        return (
            <View style={styles.centerBox}>
                <ActivityIndicator size="large" color="#1A3A6B" />
                <Text style={styles.infoText}>여권 목록을 불러오는 중입니다.</Text>
            </View>
        );
    }

    if (errorMessage) {
        return (
            <View style={styles.centerBox}>
                <Text style={styles.infoText}>{errorMessage}</Text>
            </View>
        );
    }

    if (districts.length === 0) {
        return (
            <View style={styles.centerBox}>
                <Text style={styles.infoText}>공개된 여권이 없습니다.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {districts.map((item) => {
                const imageUrl = item.thumbnailUrl;
                const coverDisplayName = item.displayName.replace(/(구|시|군)$/, "");

                return(
                    <TouchableOpacity
                        key={`${item.districtCategory}-${item.coverId}`}
                        activeOpacity={0.8}
                        style={styles.passportCover}
                    >
                        <Image 
                            source={
                                imageUrl
                                    ? {uri: imageUrl}
                                    : defaultPassportImage
                            }
                            style={styles.coverImage}
                            resizeMode="cover"
                        />
                    
                        <View style={styles.overlay} />

                    <Text 
                        style={[
                            styles.districtName,
                            item.textColor && {color: item.textColor},
                        ]}
                        >
                        {coverDisplayName}
                    </Text>
                </TouchableOpacity>
                )
            })}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingBottom: 20,
    },
    passportCover: {
        width: "48%",
        height: 200,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,

        shadowColor: "#1A3A6B",
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 4,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.18)",
    },
    coverImage: {
        width: "120%",
        height: "120%",
    },
    districtName: {
        position: "absolute",
        top: 35,
        fontSize: 20,
        fontWeight: "600",
        fontStyle: "italic",
        color: "#FFFFFF",
        zIndex: 2,
    },
    centerBox: {
        minHeight: 180,
        alignItems: "center",
        justifyContent: "center",
    },
    infoText: {
        marginTop: 10,
        fontSize: 13,
        color: "#6A7282",
    },
});
