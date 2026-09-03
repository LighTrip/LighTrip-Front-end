import { clearTokens } from "@/src/api/authToken";
import { getMyProfile, logout } from "@/src/api/profileApi";
import { useTeamMode } from "@/src/components/common/TeamModeContext";
import TopToast from "@/src/components/common/TopToast";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FriendManageModal from "../components/FriendManageModal";
import TeamManageModal from "../components/TeamManageModal";
import {
    accountMenuDummy,
    profileUserDummy,
    settingMenuDummy,
} from "../data/profileDummy";
import { subscribeProfileTabPress } from "../profileTabBus";
import { ProfileMenuItem, ProfileUser } from "../types/profile.types";

const TAB_BAR_HEIGHT = 60;

export default function ProfileView() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isCompact = width < 360;
    const horizontalPadding = isCompact ? 16 : 20;
    const profileImageSize = isCompact ? 56 : 64;
    const {
        isTeamMode,
        toggleTeamMode,
        isLocationSharing,
        isLocationSharingLoading,
        setLocationSharing,
        clearTeamMode,
    } = useTeamMode();
    const [user, setUser] = useState<ProfileUser>(profileUserDummy);
    const [isLoading, setIsLoading] = useState(true);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // 스크롤을 내렸을 때만 헤더 아래 페이드를 보여 준다.
    // 항상 켜 두면 최상단에서 첫 카드까지 흐려지므로, 실제로 잘리기 시작할 때만 나타나게 한다.
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerFadeOpacity = scrollY.interpolate({
        inputRange: [0, 24],
        outputRange: [0, 1],
        extrapolate: "clamp",
    });

    // 아래쪽 페이드는 반대로, 끝까지 내리면 사라져야 마지막 항목이 또렷하게 보인다.
    const [contentHeight, setContentHeight] = useState(0);
    const [viewportHeight, setViewportHeight] = useState(0);
    const maxScroll = Math.max(0, contentHeight - viewportHeight);
    const bottomFadeOpacity =
        maxScroll > 0
            ? scrollY.interpolate({
                  inputRange: [Math.max(0, maxScroll - 24), maxScroll],
                  outputRange: [1, 0],
                  extrapolate: "clamp",
              })
            : 0;

    const handleToggleTeamMode = async () => {
        const isToggled = await toggleTeamMode();

        // 팀이 없으면 전환되지 않는다. 팝업 대신 상단에 잠깐 안내만 띄운다.
        if (!isToggled && !isTeamMode) {
            setToastMessage("팀에 먼저 가입해야 팀 모드로 바꿀 수 있어요");
        }
    };

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
    };

    const handleLogout = () => {
        Alert.alert("로그아웃", "정말 로그아웃하시겠습니까?", [
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
                    } catch (error) {
                        // 토큰이 이미 만료된 상태면 서버 로그아웃은 실패한다.
                        // 그래도 로컬 토큰은 지워야 로그인 화면으로 빠져나갈 수 있으므로 막지 않는다.
                        console.log("로그아웃 에러:", error);
                    }

                    await clearTokens();
                    clearTeamMode();
                    router.replace("/(auth)" as any);
                },
            },
        ]);
    };

    const handleToggleLocationSharing = async () => {
        if (isLocationSharingLoading) return;

        const nextValue = !isLocationSharing;

        try {
            await setLocationSharing(nextValue);
        } catch (error) {
            console.error("위치 공유 설정 변경 실패:", error);

            Alert.alert(
                "오류",
                error instanceof Error
                    ? error.message
                    : "위치 공유 설정을 변경하지 못했습니다.",
            );
        }
    };

    const fetchMyProfile = useCallback(async () => {
        try {
            const profile = await getMyProfile();
            setUser(profile);
        } catch (error) {
            console.log("내 프로필 조회 에러:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchMyProfile();
        }, [fetchMyProfile]),
    );

    // 마이페이지 탭을 다시 누르면 열려 있던 모달을 닫고, 새로고침하며 마이페이지 탭 메인으로 복귀
    useEffect(() => {
        return subscribeProfileTabPress(() => {
            setIsTeamModalOpen(false);
            setIsFriendModalOpen(false);
            fetchMyProfile();
        });
    }, [fetchMyProfile]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1A3A6B" />
            </View>
        );
    }

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
            <View
                style={[
                    styles.fixedHeader,
                    { paddingHorizontal: horizontalPadding },
                ]}
            >
                <Text style={styles.headerTitle}>마이페이지</Text>

                <View style={styles.profileCard}>
                    <View style={styles.profileLeft}>
                        <Image
                            source={
                                user.profileImage
                                    ? { uri: user.profileImage }
                                    : require("@/assets/images/default_profile.png")
                            }
                            style={[
                                styles.profileImage,
                                {
                                    width: profileImageSize,
                                    height: profileImageSize,
                                    borderRadius: profileImageSize / 2,
                                },
                            ]}
                        />

                        <View style={styles.profileInfo}>
                            <View style={styles.nameRow}>
                                <Text
                                    style={[
                                        styles.userName,
                                        isCompact && styles.userNameCompact,
                                    ]}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {user.name}
                                </Text>
                            </View>

                            <View style={styles.locationSection}>
                                <Ionicons
                                    name="location-outline"
                                    size={16}
                                    color="#FFFFFF"
                                />
                                <Text
                                    style={styles.userLocation}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {user.location}
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.userStatusRow,
                                    isCompact && styles.userStatusRowCompact,
                                ]}
                            >
                                <Text
                                    style={styles.userStatusItem}
                                    numberOfLines={1}
                                >
                                    여권: {user.passportCount}
                                </Text>
                                <Text style={styles.userStatusDivider}>|</Text>
                                <Text
                                    style={styles.userStatusItem}
                                    numberOfLines={1}
                                >
                                    장소: {user.districtCount}
                                </Text>
                                <Text style={styles.userStatusDivider}>|</Text>
                                <Text
                                    style={styles.userStatusItem}
                                    numberOfLines={1}
                                >
                                    좋아요: {user.totallike}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.idNumberBox}>
                        <Text
                            style={styles.idNumberText}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {user.id}
                        </Text>
                    </View>
                </View>

                <Animated.View
                    style={[styles.headerFade, { opacity: headerFadeOpacity }]}
                    pointerEvents="none"
                >
                    <LinearGradient
                        colors={[
                            "#F8FAFD",
                            "rgba(248, 250, 253, 0.92)",
                            "rgba(248, 250, 253, 0)",
                        ]}
                        locations={[0, 0.45, 1]}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>
            </View>

            <Animated.ScrollView
                style={styles.scrollArea}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingHorizontal: horizontalPadding },
                ]}
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior="never"
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true },
                )}
                onLayout={(event) =>
                    setViewportHeight(event.nativeEvent.layout.height)
                }
                onContentSizeChange={(_, height) => setContentHeight(height)}
            >
                <View style={styles.sectionSet}>
                    <View style={styles.menuBox}>
                        <View style={[styles.menuItem, styles.menuItemBorder]}>
                            <View style={styles.menuLeft}>
                                <View style={styles.iconBox}>
                                    <Ionicons
                                        name="return-down-back"
                                        size={22}
                                        color="#FFFFFF"
                                    />
                                </View>

                                <View style={styles.menuTextBox}>
                                    <Text
                                        style={styles.menuTitle}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        팀 모드로 전환
                                    </Text>
                                    <Text
                                        style={styles.menuDescription}
                                        numberOfLines={2}
                                        ellipsizeMode="tail"
                                    >
                                        현재 접속 모드:{" "}
                                        {isTeamMode ? "팀" : "개인"}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[
                                    styles.teamToggle,
                                    isTeamMode
                                        ? styles.teamToggleOn
                                        : styles.teamToggleOff,
                                ]}
                                onPress={handleToggleTeamMode}
                            >
                                <View
                                    style={[
                                        styles.teamToggleCircle,
                                        isTeamMode
                                            ? styles.teamToggleCircleOn
                                            : styles.teamToggleCircleOff,
                                    ]}
                                />
                            </TouchableOpacity>
                        </View>

                        {isTeamMode && (
                            <View
                                style={[styles.menuItem, styles.menuItemBorder]}
                            >
                                <View style={styles.menuLeft}>
                                    <View style={styles.iconBox}>
                                        <Ionicons
                                            name="location"
                                            size={22}
                                            color="#FFFFFF"
                                        />
                                    </View>

                                    <View style={styles.locationShareTextBox}>
                                        <Text
                                            style={styles.menuTitle}
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        >
                                            위치 공유
                                        </Text>
                                        <Text
                                            style={styles.menuDescription}
                                            numberOfLines={2}
                                            ellipsizeMode="tail"
                                        >
                                            팀원들에게 내 현재 위치를 공유합니다.
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    disabled={isLocationSharingLoading}
                                    style={[
                                        styles.teamToggle,
                                        isLocationSharing
                                            ? styles.teamToggleOn
                                            : styles.teamToggleOff,
                                        isLocationSharingLoading &&
                                            styles.toggleDisabled,
                                    ]}
                                    onPress={handleToggleLocationSharing}
                                >
                                    <View
                                        style={[
                                            styles.teamToggleCircle,
                                            isLocationSharing
                                                ? styles.teamToggleCircleOn
                                                : styles.teamToggleCircleOff,
                                        ]}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}

                        {settingMenuDummy.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.menuItem,
                                    index !== settingMenuDummy.length - 1 &&
                                        styles.menuItemBorder,
                                ]}
                                activeOpacity={0.8}
                                onPress={() => handleMenuPress(item)}
                            >
                                <View style={styles.menuLeft}>
                                    <View style={styles.iconBox}>
                                        <Ionicons
                                            name={item.icon as any}
                                            size={22}
                                            color="#FFFFFF"
                                        />
                                    </View>

                                    <View style={styles.menuTextBox}>
                                        <Text
                                            style={styles.menuTitle}
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        >
                                            {item.title}
                                        </Text>
                                        {item.description && (
                                            <Text
                                                style={styles.menuDescription}
                                                numberOfLines={2}
                                                ellipsizeMode="tail"
                                            >
                                                {item.description}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.sectionAccount}>
                    <View style={styles.menuBox}>
                        {accountMenuDummy.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.menuItem,
                                    index !== accountMenuDummy.length - 1 &&
                                        styles.menuItemBorder,
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
                                        <Ionicons
                                            name={item.icon as any}
                                            size={22}
                                            color="#FFFFFF"
                                        />
                                    </View>

                                    <View style={styles.menuTextBox}>
                                        <Text
                                            style={styles.menuTitle}
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        >
                                            {item.title}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Animated.ScrollView>

            {/* 탭바와 맞닿는 아래쪽 경계도 위쪽과 같은 방식으로 흐린다. */}
            <Animated.View
                style={[styles.bottomFade, { opacity: bottomFadeOpacity }]}
                pointerEvents="none"
            >
                <LinearGradient
                    colors={[
                        "rgba(248, 250, 253, 0)",
                        "rgba(248, 250, 253, 0.92)",
                        "#F8FAFD",
                    ]}
                    locations={[0, 0.55, 1]}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>

            <TopToast
                message={toastMessage}
                onHide={() => setToastMessage(null)}
            />

            <TeamManageModal
                visible={isTeamModalOpen}
                onClose={() => setIsTeamModalOpen(false)}
            />

            <FriendManageModal
                visible={isFriendModalOpen}
                onClose={() => setIsFriendModalOpen(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFD",
        paddingTop: StatusBar.currentHeight || 50,
    },
    fixedHeader: {
        paddingHorizontal: 20,
        paddingTop: 13,
        backgroundColor: "#F8FAFD",
        zIndex: 1,
    },
    // 스크롤 내용이 헤더 아래에서 잘릴 때 그 경계를 가려 주는 그라데이션.
    // 메뉴 행 높이(약 67)에 비해 짧으면 아이콘이 반만 남아 얼룩처럼 보이므로 넉넉히 잡는다.
    headerFade: {
        position: "absolute",
        bottom: -56,
        left: 0,
        right: 0,
        height: 56,
    },
    // 스크롤 영역이 끝나는 지점(탭바 바로 위)을 덮는다.
    bottomFade: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: TAB_BAR_HEIGHT,
        height: 56,
    },
    scrollArea: {
        flex: 1,
        marginBottom: TAB_BAR_HEIGHT,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 18,
    },
    sectionAccount: {
        marginBottom: 0,
    },
    headerTitle: {
        color: "#000000",
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 12,
    },
    profileCard: {
        backgroundColor: "#1A3A6B",
        borderRadius: 15,
        padding: 16,
        marginBottom: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        position: "relative",
    },
    profileLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        flexShrink: 1,
        minWidth: 0,
        paddingRight: 70,
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
        minWidth: 0,
    },
    userName: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "700",
        flexShrink: 1,
    },
    userNameCompact: {
        fontSize: 21,
    },
    locationSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        marginTop: 6,
        marginBottom: 8,
        minWidth: 0,
    },
    userLocation: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "500",
        flex: 1,
        minWidth: 0,
    },
    userStatusRow: {
        flexDirection: "row",
        flexWrap: "nowrap",
        alignItems: "center",
        columnGap: 5,
        marginLeft: 3,
        paddingRight: 4,
        minWidth: 0,
    },
    userStatusRowCompact: {
        columnGap: 3,
    },
    userStatusItem: {
        color: "#FFFFFF",
        fontSize: 13,
        flexShrink: 0,
    },
    userStatusDivider: {
        color: "#FFFFFF",
        fontSize: 13,
        opacity: 0.7,
    },
    idNumberBox: {
        position: "absolute",
        top: 16,
        right: 16,
        maxWidth: 64,
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
    locationShareTextBox: {
        flex: 1,
        minWidth: 0,
        marginRight: 12,
    },
    toggleDisabled: {
        opacity: 0.5,
    },
    sectionSet: {
        marginBottom: 20,
    },
    teamToggle: {
        width: 45,
        height: 25,
        borderRadius: 20,
        padding: 2,
        justifyContent: "center",
        flexShrink: 0,
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
        gap: 10,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    menuLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        minWidth: 0,
        marginRight: 12,
    },
    menuTextBox: {
        flex: 1,
        minWidth: 0,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "#1A3A6B",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        flexShrink: 0,
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
