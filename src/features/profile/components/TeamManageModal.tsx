import { createTeam, joinTeam, searchTeamByCode } from "@/src/api/profileApi";
import { getMyTeam, getTeamMembers, leaveTeam } from "@/src/api/teamApi";
import { useTeamMode } from "@/src/components/common/TeamModeContext";
import { Ionicons } from "@expo/vector-icons";
import * as Securestore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import type { TeamResponseData } from "../types/profile.types";

type TeamManageModalProps = {
    visible: boolean;
    onClose: () => void;
};

type TeamMode = "create" | "join";

export default function TeamManageModal({
    visible,
    onClose,
}: TeamManageModalProps) {
    const [mode, setMode] = useState<TeamMode>("create");
    const [teamName, setTeamName] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    // 입력 중인 칸을 강조하기 위한 상태
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [searchedTeam, setSearchedTeam] = useState<TeamResponseData | null>(null);
    const [currentTeam, setCurrentTeam] = useState<TeamResponseData | null>(null);
    const [isLeaving, setIsLeaving] = useState(false);

    // 탈퇴하면 팀 모드도 함께 꺼야 한다. 안 그러면 없는 팀으로 팀 모드가 남는다.
    const { clearTeamMode, currentUserId } = useTeamMode();

    const isCreateMode = mode === "create";

    useEffect(() => {
        if (!visible) return;

        // 로컬 캐시를 정본으로 쓰면 안 된다. 팀에서 나갔거나 계정이 바뀌어도 캐시가 남아
        // "이미 팀에 속한" 것처럼 보이고, 그러면 팀 생성/가입 폼이 통째로 감춰진다.
        const loadCurrentTeam = async () => {
            try {
                const teamInfo = await getMyTeam();

                setCurrentTeam({
                    teamId: teamInfo.teamId,
                    teamCode: teamInfo.teamCode,
                    teamName: teamInfo.teamName,
                    createdAt: teamInfo.createdAt ?? "",
                });
            } catch (error) {
                console.log("내 팀 정보 조회 실패:", error);

                setCurrentTeam(null);
            }
        };

        loadCurrentTeam();
    }, [visible]);

    const handleChangeMode = (nextMode: TeamMode) => {
        setMode(nextMode);
        setSearchedTeam(null);
    };

    const handleChangeInviteCode = (text: string) => {
        setInviteCode(text.toUpperCase());
        setSearchedTeam(null);
    };

    const handleClose = () => {
        if (isSubmitting || isSearching) return;

        setSearchedTeam(null);
        onClose();
    };

    const handleCopyTeamCode = async (teamInfo: TeamResponseData) => {
        try {
            const Clipboard = await import("expo-clipboard");
            await Clipboard.setStringAsync(teamInfo.teamCode);
            Alert.alert("복사 완료", "팀 코드가 클립보드에 복사되었습니다.");
        } catch {
            Alert.alert(
                "복사 기능 준비 중",
                "클립보드 모듈을 사용하려면 앱을 새 빌드로 다시 설치해야 합니다.",
            );
        }
    };

    const handleShareTeamCode = async (teamInfo: TeamResponseData) => {
        await Share.share({
            message: `LighTrip 팀에 초대합니다.\n팀 이름: ${teamInfo.teamName}\n팀 코드: ${teamInfo.teamCode}`,
        });
    };

    const handleSearchTeam = async () => {
        const trimmedTeamCode = inviteCode.trim().toUpperCase();

        if (trimmedTeamCode.length === 0 || isSearching) return;

        try {
            setIsSearching(true);
            const result = await searchTeamByCode(trimmedTeamCode);
            setSearchedTeam(result);
        } catch (error) {
            setSearchedTeam(null);
            Alert.alert(
                "팀 검색 실패",
                error instanceof Error
                    ? error.message
                    : "팀 정보를 찾지 못했습니다.",
            );
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            if (isCreateMode) {
                const result = await createTeam(teamName.trim());

                Alert.alert(
                    "팀 생성 완료",
                    `${result.teamName} 팀이 생성되었습니다.\n팀 코드: ${result.teamCode}`,
                );

                setTeamName("");
                setSearchedTeam(null);
                setCurrentTeam(result);
                onClose();
                return;
            }

            const result = await joinTeam(inviteCode.trim().toUpperCase());

            Alert.alert("팀 가입 완료", `${result.teamName} 팀에 가입되었습니다.`);
            setInviteCode("");
            setSearchedTeam(null);
            setCurrentTeam(result);
            onClose();
        } catch (error) {
            console.log("팀 처리 에러:", error);
            Alert.alert(
                isCreateMode ? "팀 생성 실패" : "팀 가입 실패",
                error instanceof Error
                    ? error.message
                    : "팀 처리 중 문제가 발생했습니다.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLeaveTeam = async () => {
        if (!currentTeam) return;

        // 팀장이 나가면 서버가 팀을 해산하고 팀 여권까지 전부 삭제한다.
        let isLeader = false;

        try {
            const memberList = await getTeamMembers(currentTeam.teamId);

            isLeader = memberList.some(
                (member) =>
                    member.userId === currentUserId && member.role === "LEADER",
            );
        } catch (error) {
            console.log("팀 역할 확인 실패:", error);
        }

        Alert.alert(
            isLeader ? "팀 해산" : "팀 탈퇴",
            isLeader
                ? "팀장이 나가면 팀이 해산됩니다.\n팀원 전원의 팀 여권이 모두 삭제되며 되돌릴 수 없습니다.\n계속할까요?"
                : "정말로 팀에서 탈퇴하시겠어요?",
            [
            { text: "취소", style: "cancel" },
            {
                text: isLeader ? "해산하기" : "탈퇴하기",
                style: "destructive",
                onPress: async () => {
                    try {
                        setIsLeaving(true);

                        await leaveTeam(currentTeam.teamId);
                        clearTeamMode();

                        setCurrentTeam(null);
                        setSearchedTeam(null);

                        Alert.alert(
                            "완료",
                            isLeader
                                ? "팀이 해산되었습니다."
                                : "팀에서 탈퇴했습니다.",
                        );
                    } catch (error) {
                        console.log("팀 탈퇴 실패:", error);

                        Alert.alert(
                            "탈퇴 실패",
                            error instanceof Error
                                ? error.message
                                : "팀 탈퇴에 실패했습니다.",
                        );
                    } finally {
                        setIsLeaving(false);
                    }
                },
            },
        ]);
    };

    const isSearchDisabled =
        inviteCode.trim().length === 0 || isSearching || isSubmitting;

    const isDisabled = isCreateMode
        ? teamName.trim().length === 0 || isSubmitting
        : inviteCode.trim().length === 0 || isSubmitting || isSearching;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <Pressable style={styles.overlay} onPress={handleClose}>
                <Pressable style={styles.modalBox} onPress={() => {}}>
                    <View style={styles.header}>
                        <Text style={styles.title}>팀 관리</Text>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleClose}
                            style={styles.closeButton}
                            disabled={isSubmitting || isSearching}
                        >
                            <Ionicons name="close" size={22} color="#333333" />
                        </TouchableOpacity>
                    </View>

                    {/* 서버가 생성·가입을 모두 막으므로(TEAM_ALREADY_JOINED),
                        이미 팀이 있으면 시도조차 못 하게 폼을 감춘다. */}
                    {!currentTeam && (
                    <View style={styles.tabTrack}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[
                                styles.tabButton,
                                isCreateMode && styles.activeTabButton,
                            ]}
                            onPress={() => handleChangeMode("create")}
                            disabled={isSubmitting || isSearching}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    isCreateMode && styles.activeTabText,
                                ]}
                            >
                                팀 만들기
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[
                                styles.tabButton,
                                !isCreateMode && styles.activeTabButton,
                            ]}
                            onPress={() => handleChangeMode("join")}
                            disabled={isSubmitting || isSearching}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    !isCreateMode && styles.activeTabText,
                                ]}
                            >
                                팀 가입하기
                            </Text>
                        </TouchableOpacity>
                    </View>
                    )}

                    {currentTeam && (
                        <View style={styles.currentTeamBox}>
                            <View style={styles.currentTeamHeader}>
                                <View style={styles.currentTeamInfo}>
                                    <Text style={styles.currentTeamEyebrow}>
                                        내 팀 코드
                                    </Text>
                                    <Text style={styles.currentTeamName}>
                                        {currentTeam.teamName}
                                    </Text>
                                </View>

                                <View style={styles.currentTeamCodeBadge}>
                                    <Text style={styles.currentTeamCode}>
                                        {currentTeam.teamCode}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.currentTeamActionRow}>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={styles.currentTeamActionButton}
                                    onPress={() => handleCopyTeamCode(currentTeam)}
                                    disabled={isSubmitting || isSearching}
                                >
                                    <Ionicons
                                        name="copy-outline"
                                        size={16}
                                        color="#1A3A6B"
                                    />
                                    <Text style={styles.currentTeamActionText}>
                                        복사
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={styles.currentTeamActionButton}
                                    onPress={() => handleShareTeamCode(currentTeam)}
                                    disabled={isSubmitting || isSearching}
                                >
                                    <Ionicons
                                        name="share-social-outline"
                                        size={16}
                                        color="#1A3A6B"
                                    />
                                    <Text style={styles.currentTeamActionText}>
                                        공유
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* 팀 화면(팀 모드 전용)에만 있던 탈퇴를 여기서도 할 수 있게 한다.
                                팀이 있는 사용자는 이 모달을 먼저 열게 되는데, 기존에는
                                여기서 팀을 벗어날 방법이 없었다. */}
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styles.leaveTeamButton}
                                onPress={handleLeaveTeam}
                                disabled={isSubmitting || isSearching || isLeaving}
                            >
                                {isLeaving ? (
                                    <ActivityIndicator size="small" color="#C05A5A" />
                                ) : (
                                    <>
                                        <Ionicons
                                            name="exit-outline"
                                            size={15}
                                            color="#C05A5A"
                                        />
                                        <Text style={styles.leaveTeamText}>
                                            팀 탈퇴하기
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {currentTeam ? (
                        <Text style={styles.alreadyJoinedNotice}>
                            이미 팀에 속해 있어요. 다른 팀을 만들거나 가입하려면
                            먼저 지금 팀에서 탈퇴해 주세요.
                        </Text>
                    ) : isCreateMode ? (
                        <View>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>팀 이름</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        isInputFocused && styles.inputFocused,
                                    ]}
                                    onFocus={() => setIsInputFocused(true)}
                                    onBlur={() => setIsInputFocused(false)}
                                    placeholder="팀 이름을 입력해주세요"
                                    placeholderTextColor="#9CA3AF"
                                    value={teamName}
                                    onChangeText={setTeamName}
                                    editable={!isSubmitting && !isSearching}
                                />
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[
                                    styles.submitButton,
                                    isDisabled && styles.disableButton,
                                ]}
                                onPress={handleSubmit}
                                disabled={isDisabled}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.submitButtonText}>
                                        팀 생성하기
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>초대 코드</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        styles.codeInput,
                                        isInputFocused && styles.inputFocused,
                                    ]}
                                    onFocus={() => setIsInputFocused(true)}
                                    onBlur={() => setIsInputFocused(false)}
                                    placeholder="8자리 코드"
                                    placeholderTextColor="#9CA3AF"
                                    value={inviteCode}
                                    onChangeText={handleChangeInviteCode}
                                    autoCapitalize="characters"
                                    autoCorrect={false}
                                    maxLength={8}
                                    returnKeyType="search"
                                    onSubmitEditing={handleSearchTeam}
                                    editable={!isSubmitting && !isSearching}
                                />
                            </View>

                            <Text style={styles.noticeText}>
                                팀 생성자로부터 받은 코드를 입력하세요.
                            </Text>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[
                                    styles.searchButton,
                                    isSearchDisabled && styles.searchButtonDisabled,
                                ]}
                                onPress={handleSearchTeam}
                                disabled={isSearchDisabled}
                            >
                                {isSearching ? (
                                    <ActivityIndicator color="#1A3A6B" />
                                ) : (
                                    <Text
                                        style={[
                                            styles.searchButtonText,
                                            isSearchDisabled &&
                                                styles.searchButtonTextDisabled,
                                        ]}
                                    >
                                        팀 코드로 검색
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {searchedTeam && (
                                <View style={styles.searchResultBox}>
                                    <View style={styles.searchResultHeader}>
                                        <Ionicons
                                            name="people-circle"
                                            size={22}
                                            color="#1A3A6B"
                                        />
                                        <Text style={styles.searchResultTitle}>
                                            검색된 팀
                                        </Text>
                                    </View>

                                    <View style={styles.searchResultRow}>
                                        <Text style={styles.searchResultLabel}>
                                            팀 이름
                                        </Text>
                                        <Text style={styles.searchResultValue}>
                                            {searchedTeam.teamName}
                                        </Text>
                                    </View>

                                    <View style={styles.searchResultRow}>
                                        <Text style={styles.searchResultLabel}>
                                            팀 코드
                                        </Text>
                                        <Text style={styles.searchResultCode}>
                                            {searchedTeam.teamCode}
                                        </Text>
                                    </View>

                                    <View style={styles.searchResultRow}>
                                        <Text style={styles.searchResultLabel}>
                                            생성일
                                        </Text>
                                        <Text style={styles.searchResultValue}>
                                            {new Date(
                                                searchedTeam.createdAt,
                                            ).toLocaleDateString("ko-KR")}
                                        </Text>
                                    </View>

                                    <View style={styles.searchResultActionRow}>
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            style={styles.searchResultActionButton}
                                            onPress={() =>
                                                handleCopyTeamCode(searchedTeam)
                                            }
                                            disabled={isSubmitting || isSearching}
                                        >
                                            <Ionicons
                                                name="copy-outline"
                                                size={15}
                                                color="#1A3A6B"
                                            />
                                            <Text
                                                style={
                                                    styles.searchResultActionText
                                                }
                                            >
                                                복사
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            style={styles.searchResultActionButton}
                                            onPress={() =>
                                                handleShareTeamCode(searchedTeam)
                                            }
                                            disabled={isSubmitting || isSearching}
                                        >
                                            <Ionicons
                                                name="share-social-outline"
                                                size={15}
                                                color="#1A3A6B"
                                            />
                                            <Text
                                                style={
                                                    styles.searchResultActionText
                                                }
                                            >
                                                공유
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[
                                    styles.submitButton,
                                    isDisabled && styles.disableButton,
                                ]}
                                onPress={handleSubmit}
                                disabled={isDisabled}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.submitButtonText}>
                                        팀 합류하기
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    modalBox: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 20,
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.16,
        shadowRadius: 20,
        elevation: 8,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        color: "#111827",
        fontSize: 20,
        fontWeight: "700",
    },
    // 아이콘만 두면 터치 영역이 좁다. 원형 버튼으로 넓힌다.
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#F2F5F9",
        alignItems: "center",
        justifyContent: "center",
    },
    // 둘러보기의 전체/랭킹 토글과 같은 알약형 세그먼트로 맞춘다.
    tabTrack: {
        flexDirection: "row",
        padding: 4,
        borderRadius: 999,
        backgroundColor: "#F2F5F9",
        marginBottom: 20,
    },
    tabButton: {
        flex: 1,
        height: 40,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
    },
    activeTabButton: {
        backgroundColor: "#1A3A6B",
    },
    tabText: {
        color: "#8A93A2",
        fontSize: 14,
        fontWeight: "600",
    },
    activeTabText: {
        color: "#FFFFFF",
        fontWeight: "700",
    },
    currentTeamBox: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: "#EEF3FA",
        marginBottom: 20,
    },
    currentTeamHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
    },
    currentTeamInfo: {
        flex: 1,
    },
    currentTeamEyebrow: {
        color: "#6B7280",
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 4,
    },
    currentTeamName: {
        color: "#111827",
        fontSize: 16,
        fontWeight: "700",
    },
    currentTeamCodeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: "#FFFFFF",
    },
    currentTeamCode: {
        color: "#1A3A6B",
        fontSize: 15,
        fontWeight: "800",
        letterSpacing: 1,
    },
    currentTeamActionRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 14,
    },
    currentTeamActionButton: {
        flex: 1,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    currentTeamActionText: {
        color: "#1A3A6B",
        fontSize: 13,
        fontWeight: "700",
    },
    // 되돌릴 수 없는 동작이라 눈에 덜 띄는 텍스트 버튼으로 둔다.
    leaveTeamButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        height: 36,
        marginTop: 8,
    },
    leaveTeamText: {
        color: "#C05A5A",
        fontSize: 13,
        fontWeight: "600",
    },
    alreadyJoinedNotice: {
        color: "#6B7280",
        fontSize: 13,
        lineHeight: 20,
        textAlign: "center",
        paddingHorizontal: 8,
        paddingBottom: 4,
    },
    formGroup: {
        marginBottom: 12,
    },
    label: {
        color: "#6B7280",
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 8,
    },
    // 프로필 수정 화면의 입력칸과 같은 모양으로 통일한다.
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: "#E5EAF2",
        borderRadius: 12,
        paddingHorizontal: 14,
        backgroundColor: "#F7F9FC",
        color: "#111827",
        fontSize: 15,
        fontWeight: "600",
    },
    inputFocused: {
        borderColor: "#1A3A6B",
        backgroundColor: "#FFFFFF",
    },
    // 초대 코드는 8자리 코드라 가운데 정렬 + 자간을 주면 읽기 쉽다.
    codeInput: {
        textAlign: "center",
        letterSpacing: 4,
        fontSize: 18,
        fontWeight: "700",
    },
    noticeText: {
        color: "#9CA3AF",
        fontSize: 12,
        lineHeight: 16,
    },
    searchButton: {
        height: 46,
        borderWidth: 1,
        borderColor: "#1A3A6B",
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 14,
        backgroundColor: "#FFFFFF",
    },
    // 아웃라인 버튼은 배경을 회색으로 덮으면 안 된다. 선과 글자만 흐리게 한다.
    searchButtonDisabled: {
        borderColor: "#D7DDE7",
        backgroundColor: "#FFFFFF",
    },
    searchButtonText: {
        color: "#1A3A6B",
        fontSize: 14,
        fontWeight: "700",
    },
    searchButtonTextDisabled: {
        color: "#AEB6C2",
    },
    searchResultBox: {
        marginTop: 14,
        padding: 16,
        borderRadius: 16,
        backgroundColor: "#EEF3FA",
        gap: 10,
    },
    searchResultHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 2,
    },
    searchResultTitle: {
        color: "#1A3A6B",
        fontSize: 15,
        fontWeight: "700",
    },
    searchResultRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
    },
    searchResultLabel: {
        color: "#6B7280",
        fontSize: 12,
        fontWeight: "600",
    },
    searchResultValue: {
        flex: 1,
        color: "#374151",
        fontSize: 13,
        fontWeight: "600",
        textAlign: "right",
    },
    searchResultCode: {
        color: "#1A3A6B",
        fontSize: 13,
        fontWeight: "800",
        letterSpacing: 1,
    },
    searchResultActionRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 4,
    },
    searchResultActionButton: {
        flex: 1,
        height: 36,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
    },
    searchResultActionText: {
        color: "#1A3A6B",
        fontSize: 12,
        fontWeight: "700",
    },
    submitButton: {
        height: 54,
        backgroundColor: "#1A3A6B",
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,

        shadowColor: "#1A3A6B",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.24,
        shadowRadius: 12,
        elevation: 5,
    },
    disableButton: {
        backgroundColor: "#C3CBD8",
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
});
