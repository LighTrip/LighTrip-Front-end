import { BASE_URL } from "@/src/api/config";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Securestore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import FriendManageModal from "../components/FriendManageModal";
import TeamManageModal from "../components/TeamManageModal";
import {
    accountMenuDummy,
    profileUserDummy,
    settingMenuDummy
} from "../data/profileDummy";
import { ProfileMenuItem, ProfileUser } from "../types/profile.types";

type MyProfileResponse = {
    success: boolean;
    code: string;
    message: string;
    data: {
        userId: number;
        nickname: string;
        email: string;
        profileImg: string | null;
        friendCode: string;
        location: string | null;
        bio: string | null;
        currentMode: string;
        createdAt: string;
        stats: {
            districtCount: number;
            passportCount: number;
            likeCount: number;
        }
    }
}

export default function ProfileView() {
    const router = useRouter();

    const [isTeam, setIsTeam] = useState(false);
    const [user, setUser] = useState<ProfileUser>(profileUserDummy);
    const [isLoading, setIsLoading] = useState(true);

    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
    
    // 메뉴 클릭 함수
    const handleMenuPress = (item: ProfileMenuItem) => {
        if (item.id === "team") {
            setIsTeamModalOpen(true);
            return;
        }

        if (item.id === "friends") {
            setIsFriendModalOpen(true);
            return;
        }

        if (item.route) {
            router.push(item.route as any);
        }
    }

    // 1. 내 프로필 조회 API 연결
    useEffect(() => {
        const fetchMyProfile = async () => {
            const accessToken = await Securestore.getItemAsync("accessToken");
            try {
                const response = await fetch(`${BASE_URL}/api/v1/users/me`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    }
                });

                const result: MyProfileResponse = await response.json();

                console.log("내 프로필 조회 상태 코드:", response.status);
                console.log("내 프로필 조회 응답:", result);

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "내 프로필 조회 실패")
                }

                const profileData = result.data;

                setUser({
                    id: `#${profileData.userId}`,
                    name: profileData.nickname,
                    location: profileData.location || "위치 미설정",
                    passportCount: profileData.stats.passportCount ?? 0,
                    districtCount: profileData.stats.districtCount ?? 0,
                    totallike: profileData.stats.likeCount ?? 0,
                    profileImage: profileData.profileImg,
                });
            } catch(error) {
                console.log("내 프로필 조회 에러:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchMyProfile();
    }, []);

    if (isLoading) {
        return(
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1A3A6B" />
            </View>
        )
    }

    return(
        <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.headerTitle}>마이페이지</Text>

            {/*프로필 카드*/}
            <View style={styles.profileCard}>
                <View style={styles.profileLeft}>
                    <Image 
                        source={
                            user.profileImage
                                ? {uri: user.profileImage}
                                : require("@/assets/images/favicon.png")
                        } 
                        style={styles.profileImage} 
                    />
                    <View>
                        <Text style={styles.userName}>{user.name}</Text>
                        <View style={styles.locationSection}>
                            <Ionicons name="location-outline" size={16} color="#FFFFFF" />
                            <Text style={styles.userLocation}>{user.location}</Text>
                        </View>
                        <Text style={styles.userStatus}>
                            불빛: {user.passportCount} | 장소: {user.districtCount} | 좋아요: {user.totallike}
                        </Text>
                    </View>
                </View>

                <View style={styles.idNumberBox}>
                    <Text style={styles.idNumberText}>{user.id}</Text>
                </View>
            </View>

            {/*프리미엄*/}
            <View style={styles.premiumSection}>
            <MaterialCommunityIcons name="crown-outline" size={16} color="#B38E06" />
                <Text style={styles.premium}>프리미엄</Text>
            </View>
            <TouchableOpacity style={styles.bannerCard} activeOpacity={0.8}>
                <View style={styles.bannerTextBox}>
                    <Text style={styles.bannerTitle}>실물 여권 제작 신청</Text>
                    <Text style={styles.bannerSubtitle}>나만의 탐험 기록을 실물 책으로</Text>
                </View>
                <View style={styles.bannerIcon}>
                    <MaterialCommunityIcons name="map" size={24} color="#333333" />
                </View>
            </TouchableOpacity>

            {/*설정*/}
            <View style={styles.sectionSet}>
                <View style={styles.menuBox}>

                    {/*팀 or 개인 설정*/}
                    <View style={[styles.menuItem, styles.menuItemBorder]}>
                        <View style={styles.menuLeft}>
                            <View style={styles.iconBox}>
                                <Ionicons name="return-down-back" size={22} color="#FFFFFF" />
                            </View>
                            <View>
                                <Text style={styles.menuTitle}>팀으로 전환</Text>
                                <Text style={styles.menuDescription}>
                                    현재 접속 모드: {isTeam ? "팀" : "개인"}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[
                                styles.teamToggle,
                                isTeam ? styles.teamToggleOn : styles.teamToggleOff,
                            ]}
                            onPress={() => setIsTeam(!isTeam)}
                        >
                            <View
                                style={[
                                    styles.teamToggleCircle,
                                    isTeam ? styles.teamToggleCircleOn : styles.teamToggleCircleOff,
                                ]}
                            />
                        </TouchableOpacity>
                    </View>

                    {/*나머지*/}
                    {settingMenuDummy.map((item, index) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.menuItem,
                                index !== settingMenuDummy.length -1 && styles.menuItemBorder,
                            ]}
                            activeOpacity={0.8}
                            onPress={() => handleMenuPress(item)}
                        >
                            <View style={styles.menuLeft}>
                                <View style={styles.iconBox}>
                                <Ionicons name={item.icon as any} size={22} color="#FFFFFF" />
                                </View>

                                <View>
                                    <Text style={styles.menuTitle}>{item.title}</Text>
                                    {item.description && (
                                        <Text style={styles.menuDescription}>{item.description}</Text>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                    </View>
                </View>

            {/*계정*/}
            <View style={styles.sectionAccount}>
                <View style={styles.menuBox}>
                    {/*세부 내용*/}
                    {accountMenuDummy.map((item, index) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.menuItem,
                                index !== accountMenuDummy.length -1 && styles.menuItemBorder,
                            ]}
                            activeOpacity={0.8}
                            onPress={() => {
                                if(item.route) {
                                    router.push(item.route as any);
                                }
                            }}
                        >
                            <View style={styles.menuLeft}>
                                <View style={styles.iconBox}>
                                    <Ionicons name={item.icon as any} size={22} color="#FFFFFF" />
                                </View>

                                <View>
                                    <Text style={styles.menuTitle}>{item.title}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                    </View>
                </View>
        </ScrollView> 

        {/*팀 관리 모달*/}
        <TeamManageModal 
            visible={isTeamModalOpen}
            onClose={() => setIsTeamModalOpen(false)}
        />

        {/*친구 관리 모달*/}
        <FriendManageModal
            visible = {isFriendModalOpen}
            onClose={() => setIsFriendModalOpen(false)}
        />
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: "#F8FAFD",
    },
    content: {
        paddingHorizontal: 20,
        padding: 20,
        paddingBottom: 40,
    },

    /*사용자 정보*/
    headerTitle: {
        color: "#000000",
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 30,
        marginTop: 35,
    },
    profileCard: {
        backgroundColor: "#1A3A6B",
        borderRadius: 15,
        padding: 16,
        marginBottom: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    profileLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileImage: {
        width: 63.99,
        height: 63.99,
        borderRadius: 40265300,
        backgroundColor: "#D9D9D9",
        marginRight: 12,
    },
    userName: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 8,
    },
    locationSection: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    locationIcon: {
        color: "#FFFFFF",
        marginRight: 8,
        marginTop: -1.5
    },
    userLocation: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "500",
    },
    userStatus: {
        color: "#FFFFFF",
        fontSize: 14,
        marginLeft: 3,
    },
    idNumberBox: {
        justifyContent: "center",
        alignItems: "center",
    },
    idNumberText: {
        color: "#FFFFFF",
        fontSize: 14,
        marginTop: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8FAFD",
    },

    /*프리미엄*/
    premiumSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    premium: {
        color: "#B38E06",
        fontSize: 14,
        fontWeight: "800",
    },
    bannerCard: {
        backgroundColor: "#FFE06E",
        borderRadius: 15,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 21,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    bannerTextBox: {
        flex: 1,
        marginRight: 8,
    },
    bannerIcon: {
    },
    bannerTitle: {
        color: "#000000",
        fontSize: 16,
        fontWeight: "800",
        marginBottom: 4,
    },
    bannerSubtitle: {
        color: "#000000",
        fontSize: 12,
        fontWeight: "500",
    },

    /*설정, 계정*/
    sectionSet: {
        marginBottom: 20,
    },
    sectionAccount: {
        marginBottom: 130,
    },
    teamToggle: {
        width: 45,
        height: 25,
        borderRadius: 20,
        padding: 2,
        justifyContent: "center",
    },
    teamToggleOn: {
        backgroundColor: "#FFE06E",
        alignItems: "flex-end",
    },
    teamToggleOff: {
        backgroundColor: "#BCBCBC",
        alignItems: "flex-start",
    },
    teamToggleCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "#FFFFFF",
    },
    teamToggleCircleOff: {
        backgroundColor: "#494949",
    },
    teamToggleCircleOn: {
        backgroundColor: "#FFFFFF",
    },
    menuBox: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        borderWidth: 1.2,
        borderColor: "#FFFFFF",

        shadowColor: "#4C4C4C",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 6,
    },
    menuItem: {
        minHeight: 75,
        paddingHorizontal: 16,
        paddingVertical: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: "#262626",  
    },
    menuLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "#1A3A6B",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    menuTitle: {
        color: "#000000",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 2,
    },
    menuDescription: {
        color: "#737373",
        fontSize: 12,
    },
});