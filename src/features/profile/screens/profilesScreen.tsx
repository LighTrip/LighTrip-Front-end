import { getMyProfile, logout } from "@/src/api/profileApi";
import { useTeamMode } from "@/src/components/common/TeamModeContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import * as Securestore from "expo-secure-store";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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

const TAB_BAR_HEIGHT = 90;

export default function ProfileView() {
    const router = useRouter();

    const { isTeamMode, setIsTeamMode } = useTeamMode();
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

    // 로그아웃 함수
    const handleLogout = () => {
        Alert.alert(
            "로그아웃",
            "정말 로그아웃하시겠습니까?",
            [
                {
                    text: "취소",
                    style: "cancel",
                },
                {
                    text: "확인",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await logout();

                            await Securestore.deleteItemAsync("accessToken");
                            await Securestore.deleteItemAsync("refreshToken");

                            router.replace("/(auth)" as any);
                        }catch(error) {
                            console.log("로그아웃 에러:", error);

                            Alert.alert(
                                "로그아웃 실패",
                                error instanceof Error
                                    ? error.message
                                    : "로그아웃 중 문제가 발생했습니다."
                            )
                        }
                    }
                }
            ]
        )
    }

    useFocusEffect(
        useCallback (() => {
        const fetchMyProfile = async () => {
            try {
                const profile = await getMyProfile();
                setUser(profile);
            }catch(error) {
                console.log("내 프로필 조회 에러:", error);
            }finally {
                setIsLoading(false);
            }
        }
        fetchMyProfile();
        },[])
    );

    if (isLoading) {
        return(
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1A3A6B" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* 고정 영역 */}
            <View style={styles.fixedHeader}>
                <Text style={styles.headerTitle}>마이페이지</Text>
    
                {/* 프로필 카드 */}
                <View style={styles.profileCard}>
                    <View style={styles.profileLeft}>
                        <Image
                            source={
                                user.profileImage
                                    ? { uri: user.profileImage }
                                    : require("@/assets/images/default_profile.png")
                            }
                            style={styles.profileImage}
                        />
    
                        <View style={styles.profileInfo}>
                            <View style={styles.nameRow}>
                                <Text style={styles.userName}>{user.name}</Text>
                            </View>
    
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
            </View>
    
            {/* 스크롤 영역 */}
            <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior="never"
            >
                {/* 프리미엄 */}
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
    
                {/* 설정 */}
                <View style={styles.sectionSet}>
                    <View style={styles.menuBox}>
                        <View style={[styles.menuItem, styles.menuItemBorder]}>
                            <View style={styles.menuLeft}>
                                <View style={styles.iconBox}>
                                    <Ionicons name="return-down-back" size={22} color="#FFFFFF" />
                                </View>
    
                                <View>
                                    <Text style={styles.menuTitle}>팀으로 전환</Text>
                                    <Text style={styles.menuDescription}>
                                        현재 접속 모드: {isTeamMode ? "팀" : "개인"}
                                    </Text>
                                </View>
                            </View>
    
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[
                                    styles.teamToggle,
                                    isTeamMode ? styles.teamToggleOn : styles.teamToggleOff,
                                ]}
                                onPress={() => setIsTeamMode(!isTeamMode)}
                            >
                                <View
                                    style={[
                                        styles.teamToggleCircle,
                                        isTeamMode ? styles.teamToggleCircleOn : styles.teamToggleCircleOff,
                                    ]}
                                />
                            </TouchableOpacity>
                        </View>
    
                        {settingMenuDummy.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.menuItem,
                                    index !== settingMenuDummy.length - 1 && styles.menuItemBorder,
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
    
                {/* 계정 */}
                <View style={styles.sectionAccount}>
                    <View style={styles.menuBox}>
                        {accountMenuDummy.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.menuItem,
                                    index !== accountMenuDummy.length - 1 && styles.menuItemBorder,
                                ]}
                                activeOpacity={0.8}
                                onPress={() => {
                                    if (item.id === "logout") {
                                        handleLogout();
                                        return;
                                    }
    
                                    if (item.route) {
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
    
            <TeamManageModal
                visible={isTeamModalOpen}
                onClose={() => setIsTeamModalOpen(false)}
            />
    
            <FriendManageModal
                visible={isFriendModalOpen}
                onClose={() => setIsFriendModalOpen(false)}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: "#F8FAFD",
    },
    fixedHeader: {
        paddingHorizontal: 20,
        backgroundColor: "#F8FAFD",
    },
    scrollArea: {
        flex: 1,
        marginBottom: TAB_BAR_HEIGHT,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom:  20,
    },
    sectionAccount: {
        marginBottom: 0,
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
        flexShrink: 1,
        minWidth: 0,
    },
    profileInfo: {
        flex: 1,
        minWidth: 0,
    },
    profileImage: {
        width: 63.99,
        height: 63.99,
        borderRadius: 40265300,
        backgroundColor: "#D9D9D9",
        marginRight: 12,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    userName: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "700",
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
        marginLeft: 8,
        alignItems: "flex-end",
        flexShrink: 0,
    },
    idNumberText: {
        color: "#FFFFFF",
        fontSize: 14,
        marginTop: 8,
        textAlign: "right",
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