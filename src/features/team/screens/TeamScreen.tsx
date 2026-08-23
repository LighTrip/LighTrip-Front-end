import {
    getMyTeam,
    getTeamInfo,
    getTeamLiveLocations,
    getTeamMembers,
    leaveTeam,
} from "@/src/api/teamApi";
import { useTeamMode } from "@/src/components/common/TeamModeContext";
import { naverReverseGeocode } from "@/src/features/map/utils/mapUtils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Securestore from "expo-secure-store";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import type {
    TeamInfo,
    TeamLiveLocation,
    TeamMember,
} from "../types/team.types";

const LIVE_LOCATION_POLL_INTERVAL_MS = 30 * 1000;

export default function TeamView() {
    const router = useRouter();
    const {
        clearTeamMode,
        currentUserId,
        isLocationSharing,
        isTeamMode,
        isTeamLocationSocketConnected,
        teamLiveLocations,
        setTeamLiveLocations,
    } = useTeamMode();
    const [team, setTeam] = useState<TeamInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isMemberOpen, setIsMemberOpen] = useState(false);
    const [isMemberLoading, setIsMemberLoading] = useState(false);

    const [liveLocations, setLiveLocations] = useState<TeamLiveLocation[]>([]);
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    const [locationNames, setLocationNames] = useState<Record<number, string>>({});
    const visibleLiveLocations = useMemo(
        () =>
            liveLocations.filter(
                (location) => isLocationSharing || location.userId !== currentUserId,
            ),
        [currentUserId, isLocationSharing, liveLocations],
    );
    const isWaitingForMyLiveLocation =
        isLocationSharing &&
        currentUserId !== null &&
        !visibleLiveLocations.some((location) => location.userId === currentUserId);

    const getLocationMember = (location: TeamLiveLocation) =>
        members.find((member) => member.userId === location.userId);

    const getDisplayLocationName = (location: TeamLiveLocation) => {
        const resolvedName = locationNames[location.userId];

        if (resolvedName) return resolvedName;
        if (location.placeName && location.placeName !== "현재 위치") {
            return location.placeName;
        }

        return "위치 확인 중...";
    };

    const handleCopyTeamCode = async () => {
        if (!team?.teamCode) return;

        try {
            const Clipboard = await import("expo-clipboard");
            await Clipboard.setStringAsync(team.teamCode);
            Alert.alert("복사 완료", "팀 코드가 클립보드에 복사되었습니다.");
        } catch {
            Alert.alert(
                "복사 기능 준비 중",
                "클립보드 모듈을 사용하려면 앱을 새 빌드로 다시 설치해야 합니다.",
            );
        }
    };

    const handleShareTeamCode = async () => {
        if (!team?.teamCode) return;

        await Share.share({
            message: `LighTrip 팀에 초대합니다.\n팀 이름: ${team.teamName}\n팀 코드: ${team.teamCode}`,
        });
    };
    const fetchTeamInfo = async () => {
        try {
            setIsLoading(true);

            const savedTeamId = await Securestore.getItemAsync("teamId");
            const teamData = savedTeamId
                ? await getTeamInfo(Number(savedTeamId))
                : await getMyTeam();

            setTeam(teamData);
        } catch (error) {
            console.error("팀 실시간 위치 조회 실패:", error);
            Alert.alert("오류", "팀원들의 위치 정보를 불러오지 못했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeaveTeam = async () => {
        if (!team) return;

        // 팀장이 나가면 서버가 팀을 해산하고 팀 여권까지 전부 삭제한다
        // (TeamService.leave -> disbandTeam). 같은 문구로 물으면 안 된다.
        let isLeader = false;

        try {
            const memberList = members.length > 0
                ? members
                : await getTeamMembers(team.teamId);

            isLeader = memberList.some(
                (member) => member.userId === currentUserId && member.role === "LEADER",
            );
        } catch (error) {
            console.log("팀 역할 확인 실패:", error);
        }

        const title = isLeader ? "팀 해산" : "팀 탈퇴";
        const message = isLeader
            ? "팀장이 나가면 팀이 해산됩니다.\n팀원 전원의 팀 여권이 모두 삭제되며 되돌릴 수 없습니다.\n계속할까요?"
            : "정말로 팀에서 탈퇴하시겠어요?";

        Alert.alert(title, message, [
            {
                text: "취소",
                style: "cancel",
            },
            {
                text: isLeader ? "해산하기" : "탈퇴하기",
                style: "destructive",
                onPress: async () => {
                    try {
                        await leaveTeam(team.teamId);
                        clearTeamMode();

                        Alert.alert(
                            "완료",
                            isLeader
                                ? "팀이 해산되었습니다."
                                : "팀에서 탈퇴했습니다.",
                        );

                        setTeam(null);
                        setMembers([]);
                        setLiveLocations([]);
                        setIsMemberOpen(false);
                        setIsLocationOpen(false);
                    } catch (error) {
                        console.error("팀 탈퇴 실패:", error);

                        Alert.alert(
                            "탈퇴 실패",
                            error instanceof Error
                                ? error.message
                                : "팀 탈퇴에 실패했습니다.",
                        );
                    }
                },
            },
        ]);
    };

    const handlePressMembers = async () => {
        if (!team) return;

        if (isMemberOpen) {
            setIsMemberOpen(false);
            return;
        }

        try {
            setIsMemberLoading(true);

            const memberData = await getTeamMembers(team.teamId);
            setMembers(memberData);
            setIsMemberOpen(true);
        } catch (error) {
            console.error("팀 실시간 위치 조회 실패:", error);
            Alert.alert("오류", "팀원들의 위치 정보를 불러오지 못했습니다.");
        } finally {
            setIsMemberLoading(false);
        }
    };

    const handlePressLiveLocations = async () => {
        if (!team || !isTeamMode) return;

        if (isLocationOpen) {
            setIsLocationOpen(false);
            return;
        }

        setLiveLocations(teamLiveLocations);
        setIsLocationOpen(true);

        try {
            setIsLocationLoading(teamLiveLocations.length === 0);

            const [locationData, memberData] = await Promise.all([
                getTeamLiveLocations(team.teamId),
                members.length > 0
                    ? Promise.resolve(members)
                    : getTeamMembers(team.teamId),
            ]);

            const mergedLocationData = [...locationData];

            teamLiveLocations.forEach((cachedLocation) => {
                const exists = mergedLocationData.some(
                    (location) => location.userId === cachedLocation.userId,
                );

                if (!exists) {
                    mergedLocationData.push(cachedLocation);
                }
            });

            setMembers(memberData);
            setLiveLocations(mergedLocationData);
            setTeamLiveLocations(mergedLocationData);
        } catch (error) {
            console.error("팀 실시간 위치 조회 실패:", error);
            Alert.alert("오류", "팀원들의 위치 정보를 불러오지 못했습니다.");
        } finally {
            setIsLocationLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamInfo();
    }, []);

    useEffect(() => {
        if (!isTeamMode || !isLocationOpen || !team) return;

        const intervalId = setInterval(async () => {
            try {
                const locationData = await getTeamLiveLocations(team.teamId);
                setLiveLocations(locationData);
                setTeamLiveLocations(locationData);
            } catch {
                // 실시간 위치 갱신 실패 시 다음 주기에서 다시 시도합니다.
            }
        }, LIVE_LOCATION_POLL_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, [isTeamMode, isLocationOpen, team, setTeamLiveLocations]);

    useEffect(() => {
        if (isTeamMode) return;

        setIsLocationOpen(false);
        setLiveLocations([]);
        setLocationNames({});
    }, [isTeamMode]);

    useEffect(() => {
        if (!isLocationOpen) return;

        setLiveLocations(teamLiveLocations);
    }, [isLocationOpen, teamLiveLocations]);

    useEffect(() => {
        if (!isLocationOpen || visibleLiveLocations.length === 0) return;

        let isMounted = true;

        const resolveLocationNames = async () => {
            const entries = await Promise.all(
                visibleLiveLocations.map(async (location) => {
                    if (location.placeName && location.placeName !== "현재 위치") {
                        return [location.userId, location.placeName] as const;
                    }

                    const address = await naverReverseGeocode(
                        location.latitude,
                        location.longitude,
                    );

                    return [
                        location.userId,
                        address ?? "장소명 없음",
                    ] as const;
                }),
            );

            if (!isMounted) return;

            setLocationNames((currentNames) => ({
                ...currentNames,
                ...Object.fromEntries(entries),
            }));
        };

        resolveLocationNames();

        return () => {
            isMounted = false;
        };
    }, [isLocationOpen, visibleLiveLocations]);

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>
                    팀 정보를 불러오는 중...
                </Text>
            </View>
        );
    }

    if (!team) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyTitle}>팀 정보가 없습니다.</Text>

                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchTeamInfo}
                >
                    <Text style={styles.retryButtonText}>다시 불러오기</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.headerTitle}>팀 페이지</Text>

            <View style={styles.teamCard}>
                <View style={styles.teamImage}>
                    <Ionicons name="people" size={34} color="#FFFFFF" />
                </View>

                <Text style={styles.teamName}>{team.teamName}</Text>

                <View style={styles.codeRow}>
                    <Text style={styles.codeLabel}>팀 코드</Text>
                    <Text style={styles.codeValue}>{team.teamCode}</Text>
                </View>

                <View style={styles.codeActionRow}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.codeActionButton}
                        onPress={handleCopyTeamCode}
                    >
                        <Ionicons name="copy-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.codeActionText}>복사</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.codeActionButton}
                        onPress={handleShareTeamCode}
                    >
                        <Ionicons name="share-social-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.codeActionText}>공유</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>생성일</Text>
                    <Text style={styles.infoValue}>
                        {new Date(team.createdAt).toLocaleDateString("ko-KR")}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.menuItem}
                onPress={handlePressMembers}
            >
                <View style={styles.menuIconBox}>
                    <Ionicons name="people-outline" size={22} color="#FFFFFF" />
                </View>

                <View style={styles.menuTextArea}>
                    <Text style={styles.menuTitle}>팀원 목록</Text>
                    <Text style={styles.menuDescription}>
                        팀원들의 정보를 확인해요
                    </Text>
                </View>

                <Ionicons
                    name={isMemberOpen ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#9CA3AF"
                />
            </TouchableOpacity>

            {isMemberOpen && (
                <View style={styles.memberListBox}>
                    {isMemberLoading ? (
                        <View style={styles.memberLoadingBox}>
                            <ActivityIndicator size="small" />
                            <Text style={styles.memberLoadingText}>
                                팀원 목록을 불러오는 중...
                            </Text>
                        </View>
                    ) : members.length === 0 ? (
                        <Text style={styles.emptyMemberText}>
                            팀원이 없습니다.
                        </Text>
                    ) : (
                        members.map((member) => (
                            <View
                                key={member.userId}
                                style={styles.memberItem}
                            >
                                {member.profileImg &&
                                member.profileImg.trim() !== "" ? (
                                    <Image
                                        source={{ uri: member.profileImg }}
                                        style={styles.memberProfileImage}
                                    />
                                ) : (
                                    <View style={styles.memberProfile}>
                                        <Text style={styles.memberProfileText}>
                                            {member.nickname.charAt(0)}
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.memberInfo}>
                                    <Text style={styles.memberName}>
                                        {member.nickname}
                                    </Text>
                                    <Text style={styles.memberRole}>
                                        {member.role === "LEADER"
                                            ? "팀장"
                                            : "팀원"}
                                    </Text>
                                </View>

                                <View
                                    style={[
                                        styles.roleBadge,
                                        member.role === "LEADER"
                                            ? styles.leaderBadge
                                            : styles.memberBadge,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.roleBadgeText,
                                            member.role === "LEADER"
                                                ? styles.leaderBadgeText
                                                : styles.memberBadgeText,
                                        ]}
                                    >
                                        {member.role === "LEADER"
                                            ? "LEADER"
                                            : "MEMBER"}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            )}

            <TouchableOpacity
                style={styles.menuItem}
                onPress={handlePressLiveLocations}
            >
                <View style={styles.menuIconBox}>
                    <Ionicons name="location-outline" size={22} color="#FFFFFF" />
                </View>

                <View style={styles.menuTextArea}>
                    <Text style={styles.menuTitle}>실시간 위치</Text>
                    <Text style={styles.menuDescription}>
                        지도에서 팀원들의 현재 위치를 확인해요
                    </Text>
                </View>

                <Ionicons
                    name={isLocationOpen ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#9CA3AF"
                />
            </TouchableOpacity>

            {isLocationOpen && (
                <View style={styles.locationMapBox}>
                    {(isWaitingForMyLiveLocation ||
                        (isLocationSharing && !isTeamLocationSocketConnected)) && (
                        <View style={styles.locationGuideBox}>
                            <ActivityIndicator size="small" color="#1A3A6B" />
                            <View style={styles.locationGuideTextBox}>
                                <Text style={styles.locationGuideTitle}>
                                    실시간 위치를 준비 중입니다.
                                </Text>
                                <Text style={styles.locationGuideDescription}>
                                    GPS와 실시간 연결이 준비되면 지도에 위치가 표시됩니다.
                                </Text>
                            </View>
                        </View>
                    )}

                    {isLocationLoading ? (
                        <View style={styles.memberLoadingBox}>
                            <ActivityIndicator size="small" />
                            <Text style={styles.memberLoadingText}>
                                위치 정보를 불러오는 중...
                            </Text>
                        </View>
                    ) : visibleLiveLocations.length === 0 ? (
                        <Text style={styles.emptyMemberText}>
                            현재 위치를 공유 중인 팀원이 없습니다.
                        </Text>
                    ) : (
                        <>
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={styles.openMapButton}
                                onPress={() => router.push("/(tabs)")}
                            >
                                <Ionicons
                                    name="map-outline"
                                    size={17}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.openMapButtonText}>
                                    지도에서 보기
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.locationSummaryBox}>
                                {visibleLiveLocations.map((location) => (
                                    <View
                                        key={location.userId}
                                        style={styles.locationSummaryItem}
                                    >
                                        <Text
                                            style={styles.locationSummaryName}
                                        >
                                            {location.nickname}
                                        </Text>

                                        <Text
                                            style={styles.locationSummaryPlace}
                                        >
                                            현재 위치: {" "}
                                            {getDisplayLocationName(location)}
                                        </Text>

                                        <Text
                                            style={styles.locationSummaryTime}
                                        >
                                            최근 공유: {" "}
                                            {new Date(
                                                location.timestamp,
                                            ).toLocaleString("ko-KR")}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                </View>
            )}

            <TouchableOpacity
                style={styles.leaveButton}
                onPress={handleLeaveTeam}
            >
                <Text style={styles.leaveButtonText}>팀 탈퇴하기</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFD",
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 120,
    },
    centerContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: "#777777",
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333333",
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: "#1A3A6B",
    },
    retryButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#111111",
        marginBottom: 20,
    },
    teamCard: {
        borderRadius: 18,
        padding: 22,
        backgroundColor: "#1A3A6B",
        alignItems: "center",
        marginBottom: 22,

        shadowColor: "#1A3A6B",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.22,
        shadowRadius: 14,
        elevation: 5,
    },
    teamImage: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "rgba(255, 255, 255, 0.16)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
    },
    teamImageText: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1A3A6B",
    },
    teamName: {
        fontSize: 22,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 18,
        textAlign: "center",
    },
    codeRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 10,
        width: "100%",
        justifyContent: "space-between",
    },
    codeLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6B7280",
    },
    codeValue: {
        fontSize: 16,
        fontWeight: "800",
        color: "#1A3A6B",
        letterSpacing: 1,
    },
    codeActionRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 12,
        width: "100%",
    },
    codeActionButton: {
        flex: 1,
        height: 42,
        borderRadius: 12,
        backgroundColor: "rgba(255, 255, 255, 0.14)",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    codeActionText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700",
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingTop: 12,
    },
    infoLabel: {
        fontSize: 13,
        color: "rgba(255, 255, 255, 0.7)",
    },
    infoValue: {
        fontSize: 13,
        color: "#FFFFFF",
        fontWeight: "600",
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        padding: 18,
        borderRadius: 18,
        marginBottom: 12,
        backgroundColor: "#FFFFFF",

        shadowColor: "#4c4c4c",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    menuIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#1A3A6B",
        alignItems: "center",
        justifyContent: "center",
    },
    menuTextArea: {
        flex: 1,
    },
    menuTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },
    menuDescription: {
        marginTop: 3,
        fontSize: 13,
        color: "#6B7280",
    },
    menuArrow: {
        fontSize: 13,
        color: "#888888",
        fontWeight: "600",
    },
    memberListBox: {
        padding: 16,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
        marginTop: -4,
        marginBottom: 12,

        shadowColor: "#4c4c4c",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    memberLoadingBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
    },
    memberLoadingText: {
        marginLeft: 8,
        fontSize: 13,
        color: "#777777",
    },
    emptyMemberText: {
        fontSize: 14,
        color: "#888888",
        textAlign: "center",
        paddingVertical: 12,
    },
    memberItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    memberProfile: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#E5ECFC",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    memberProfileImage: {
        width: 42,
        height: 42,
        borderRadius: 21,
        marginRight: 12,
        backgroundColor: "#E5ECFC",
    },
    memberProfileText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1A3A6B",
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 15,
        fontWeight: "700",
        color: "#222222",
    },
    memberRole: {
        marginTop: 3,
        fontSize: 12,
        color: "#888888",
    },
    roleBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },
    leaderBadge: {
        backgroundColor: "#E5ECFC",
    },
    memberBadge: {
        backgroundColor: "#F2F2F2",
    },
    roleBadgeText: {
        fontSize: 11,
        fontWeight: "700",
    },
    leaderBadgeText: {
        color: "#1A3A6B",
    },
    memberBadgeText: {
        color: "#777777",
    },
    locationMapBox: {
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#EEEEEE",
        backgroundColor: "#FFFFFF",
        marginTop: -4,
        marginBottom: 12,
    },
    locationGuideBox: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 14,
        backgroundColor: "#EEF4FF",
        marginBottom: 12,
    },
    locationGuideTextBox: {
        flex: 1,
        marginLeft: 10,
    },
    locationGuideTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#1A3A6B",
    },
    locationGuideDescription: {
        marginTop: 3,
        fontSize: 12,
        color: "#5D6F89",
        lineHeight: 16,
    },
    // 팀원 실시간 위치는 메인 지도에 표시되므로 여기서는 그쪽으로 보낸다.
    openMapButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        height: 46,
        borderRadius: 14,
        backgroundColor: "#1A3A6B",
        marginBottom: 12,
    },
    openMapButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },
    locationSummaryBox: {
        marginTop: 12,
    },
    locationSummaryItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    locationSummaryName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#222222",
    },
    locationSummaryPlace: {
        marginTop: 4,
        fontSize: 13,
        color: "#1A3A6B",
        fontWeight: "600",
    },
    locationSummaryTime: {
        marginTop: 3,
        fontSize: 11,
        color: "#999999",
    },
    leaveButton: {
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 4,
    },
    leaveButtonText: {
        color: "#9CA3AF",
        fontSize: 13,
        fontWeight: "600",
        textDecorationLine: "underline",
    },
});
