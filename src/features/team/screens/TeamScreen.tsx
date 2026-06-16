import { getTeamInfo, getTeamLiveLocations, getTeamMembers, leaveTeam } from "@/src/api/teamApi";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import type { TeamInfo, TeamLiveLocation, TeamMember } from "../types/team.types";

export default function TeamView() {

    const [team, setTeam] = useState<TeamInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // 팀원
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isMemberOpen, setIsMemberOpen] = useState(false);
    const [isMemberLoading, setIsMemberLoading] = useState(false);

    // 실시간 위치
    const [liveLocations, setLiveLocations] = useState<TeamLiveLocation[]>([]);
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [isLocationLoading, setIsLocationLoading] = useState(false);

    // 1. 팀 정보 조회 호출
    const fetchTeamInfo = async () => {
        try {
        setIsLoading(true);

        // 테스트 팀 Id
        const teamId = 26;

        /*const savedTeamId = await Securestore.getItemAsync("teamId");
        const savedTeamCode = await Securestore.getItemAsync("teamCode");
        const savedTeamName = await Securestore.getItemAsync("teamName");

        console.log("저장된 teamId:", savedTeamId);
        console.log("저장된 teamCode:", savedTeamCode);
        console.log("저장된 teamName:", savedTeamName);

        if (!savedTeamId) {
            setTeam(null);
            return;
        }

        const data = await getTeamInfo(Number(savedTeamId));
        */

        const teamData = await getTeamInfo(teamId);
        setTeam(teamData);
        } catch (error) {
            console.error("팀 정보 조회 실패:", error);
            Alert.alert("오류", "팀 정보를 불러오지 못했습니다.");
        } finally {
        setIsLoading(false);
        }
    };

    // 2. 팀 탈퇴 호출
    const handleLeaveTeam = () => {
        if (!team) return;
    
        Alert.alert(
            "팀 탈퇴",
            "정말로 팀에서 탈퇴하시겠어요?",
            [
                {
                    text: "취소",
                    style: "cancel",
                },
                {
                    text: "탈퇴하기",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await leaveTeam(team.teamId);
    
                            Alert.alert("완료", "팀에서 탈퇴했습니다.");
                            setTeam(null);
                        } catch (error) {
                            console.error("팀 탈퇴 실패:", error);
    
                            Alert.alert(
                                "탈퇴 실패",
                                error instanceof Error
                                    ? error.message
                                    : "팀 탈퇴에 실패했습니다."
                            );
                        }
                    },
                },
            ]
        );
    };

    // 3. 팀원 목록 조회 호출
    const handlePressMembers = async () => {
        if (!team) return;
    
        // 이미 열려 있으면 닫기
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
            console.error("팀 멤버 목록 조회 실패:", error);
            Alert.alert("오류", "팀원 목록을 불러오지 못했습니다.");
        } finally {
            setIsMemberLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamInfo();
    }, []);

    if (isLoading) {
        return (
        <View style={styles.centerContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>팀 정보를 불러오는 중...</Text>
        </View>
        );
    }

    // 4. 실시간 위치 호출
    const handlePressLiveLocations = async () => {
        if (!team) return;
    
        // 이미 열려 있으면 닫기
        if (isLocationOpen) {
            setIsLocationOpen(false);
            return;
        }
    
        try {
            setIsLocationLoading(true);
    
            const locationData = await getTeamLiveLocations(team.teamId);
            setLiveLocations(locationData);
            setIsLocationOpen(true);
        } catch (error) {
            console.error("팀 실시간 위치 조회 실패:", error);
            Alert.alert("오류", "팀원들의 위치 정보를 불러오지 못했습니다.");
        } finally {
            setIsLocationLoading(false);
        }
    };

    if (!team) {
        return (
        <View style={styles.centerContainer}>
            <Text style={styles.emptyTitle}>팀 정보가 없습니다.</Text>

            <TouchableOpacity style={styles.retryButton} onPress={fetchTeamInfo}>
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
                <Text style={styles.teamImageText}>✈️</Text>
            </View>

            <Text style={styles.teamName}>{team.teamName}</Text>

            <View style={styles.codeRow}>
                <Text style={styles.codeLabel}>팀 코드</Text>
                <Text style={styles.codeValue}>{team.teamCode}</Text>
            </View>

            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>팀 ID</Text>
                <Text style={styles.infoValue}>{team.teamId}</Text>
            </View>

            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>생성일</Text>
                <Text style={styles.infoValue}>
                    {new Date(team.createdAt).toLocaleDateString("ko-KR")}
                </Text>
            </View>
        </View>

        {/*팀원 목록*/}
        <TouchableOpacity style={styles.menuItem} onPress={handlePressMembers}>
            <View style={styles.menuTitleRow}>
        <       Text style={styles.menuTitle}>팀원 목록</Text>
                <Text style={styles.menuArrow}>{isMemberOpen ? "▲" : "▼"}</Text>
            </View>
            <Text style={styles.menuDescription}>팀원들의 정보를 확인해요</Text>
        </TouchableOpacity>

        {isMemberOpen && (
            <View style={styles.memberListBox}>
                {isMemberLoading ? (
                    <View style={styles.memberLoadingBox}>
                        <ActivityIndicator size="small" />
                        <Text style={styles.memberLoadingText}>팀원 목록을 불러오는 중...</Text>
                    </View>
                ) : members.length === 0 ? (
                    <Text style={styles.emptyMemberText}>팀원이 없습니다.</Text>
                ) : (
                    members.map((member) => (
                        <View key={member.userId} style={styles.memberItem}>
                            {member.profileImg && member.profileImg.trim() !== "" ? (
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
                                <Text style={styles.memberName}>{member.nickname}</Text>
                                <Text style={styles.memberRole}>
                                    {member.role === "LEADER" ? "팀장" : "팀원"}
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
                                    {member.role === "LEADER" ? "LEADER" : "MEMBER"}
                                </Text>
                            </View>
                        </View>
                    ))
                )}
            </View>
        )}

        {/*실시간 위치*/}
        <TouchableOpacity style={styles.menuItem} onPress={handlePressLiveLocations}>
            <View style={styles.menuTitleRow}>
                <Text style={styles.menuTitle}>실시간 위치</Text>
                <Text style={styles.menuArrow}>{isLocationOpen ? "▲" : "▼"}</Text>
            </View>
            <Text style={styles.menuDescription}>팀원들의 현재 위치를 확인해요</Text>
        </TouchableOpacity>

        {isLocationOpen && (
            <View style={styles.locationListBox}>
                {isLocationLoading ? (
                    <View style={styles.memberLoadingBox}>
                        <ActivityIndicator size="small" />
                        <Text style={styles.memberLoadingText}>
                            위치 정보를 불러오는 중...
                        </Text>
                    </View>
                ) : liveLocations.length === 0 ? (
                <Text style={styles.emptyMemberText}>
                    현재 위치를 공유 중인 팀원이 없습니다.
                </Text>
                ) : (
                    liveLocations.map((location) => (
                    <View key={location.userId} style={styles.locationItem}>
                        <View style={styles.locationIcon}>
                            <Text style={styles.locationIconText}>📍</Text>
                        </View>
                        
                        <View style={styles.locationInfo}>
                            <Text style={styles.locationName}>
                                {location.nickname}
                            </Text>
                            
                            <Text style={styles.locationPlace}>
                                {location.placeName || "장소명 없음"}
                            </Text>

                            <Text style={styles.locationDetail}>
                                위도 {location.latitude}, 경도 {location.longitude}
                            </Text>

                            <Text style={styles.locationTime}>
                                최근 공유: {new Date(location.timestamp).toLocaleString("ko-KR")}
                            </Text>
                        </View>
                    </View>
                    ))
                )}
            </View>
        )}

        {/*팀 탈퇴하기*/}
        <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveTeam}>
            <Text style={styles.leaveButtonText}>팀 탈퇴하기</Text>
        </TouchableOpacity>
    </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
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
        borderRadius: 24,
        padding: 24,
        backgroundColor: "#E5ECFC",
        alignItems: "center",
        marginBottom: 20,
    },
    teamImage: {
        width: 82,
        height: 82,
        borderRadius: 41,
        backgroundColor: "#B2CAFF",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
    },
    teamImageText: {
        fontSize: 34,
    },
    teamName: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111111",
        marginBottom: 16,
    },
    codeRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
        width: "100%",
        justifyContent: "space-between",
    },
    codeLabel: {
        fontSize: 14,
        color: "#777777",
    },
    codeValue: {
        fontSize: 15,
        fontWeight: "700",
        color: "#2DC59F",
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingVertical: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: "#777777",
    },
    infoValue: {
        fontSize: 14,
        color: "#222222",
        fontWeight: "500",
    },
    menuItem: {
        padding: 18,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#EEEEEE",
        marginBottom: 12,
        backgroundColor: "#FFFFFF",
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#222222",
    },
    menuDescription: {
        marginTop: 4,
        fontSize: 13,
        color: "#888888",
    },
    leaveButton: {
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#FF4D4F",
        alignItems: "center",
        justifyContent: "center",
    },
    leaveButtonText: {
        color: "#FF4D4F",
        fontSize: 15,
        fontWeight: "700",
    },
    menuTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    menuArrow: {
        fontSize: 14,
        color: "#888888",
    },
    memberListBox: {
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#EEEEEE",
        backgroundColor: "#FFFFFF",
        marginTop: -4,
        marginBottom: 12,
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
    memberProfileImage: {
        width: 42,
        height: 42,
        borderRadius: 21,
        marginRight: 12,
        backgroundColor: "#E5ECFC",
    },
    locationListBox: {
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#EEEEEE",
        backgroundColor: "#FFFFFF",
        marginTop: -4,
        marginBottom: 12,
    },
    locationItem: {
        flexDirection: "row",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    locationIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#E5ECFC",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    locationIconText: {
        fontSize: 18,
    },
    locationInfo: {
        flex: 1,
    },
    locationName: {
        fontSize: 15,
        fontWeight: "700",
        color: "#222222",
    },
    locationPlace: {
        marginTop: 4,
        fontSize: 14,
        color: "#1A3A6B",
        fontWeight: "600",
    },
    locationDetail: {
        marginTop: 3,
        fontSize: 12,
        color: "#888888",
    },
    locationTime: {
        marginTop: 3,
        fontSize: 11,
        color: "#AAAAAA",
    },
});