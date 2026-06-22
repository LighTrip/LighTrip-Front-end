import { createTeam, joinTeam, searchTeamByCode } from "@/src/api/profileApi";
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
    const [searchedTeam, setSearchedTeam] = useState<TeamResponseData | null>(null);
    const [currentTeam, setCurrentTeam] = useState<TeamResponseData | null>(null);

    const isCreateMode = mode === "create";

    useEffect(() => {
        if (!visible) return;

        const loadCurrentTeam = async () => {
            const [savedTeamId, savedTeamCode, savedTeamName] = await Promise.all([
                Securestore.getItemAsync("teamId"),
                Securestore.getItemAsync("teamCode"),
                Securestore.getItemAsync("teamName"),
            ]);

            if (!savedTeamId || !savedTeamCode || !savedTeamName) {
                setCurrentTeam(null);
                return;
            }

            setCurrentTeam({
                teamId: Number(savedTeamId),
                teamCode: savedTeamCode,
                teamName: savedTeamName,
                createdAt: "",
            });
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

                    <View style={styles.tabContainer}>
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
                        </View>
                    )}

                    {isCreateMode ? (
                        <View>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>팀 이름</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="팀 이름을 입력해주세요"
                                    placeholderTextColor="#A0A0A0"
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
                                    style={styles.input}
                                    placeholder="초대 코드를 입력해주세요"
                                    placeholderTextColor="#A0A0A0"
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
                                    (inviteCode.trim().length === 0 ||
                                        isSearching ||
                                        isSubmitting) &&
                                        styles.disableButton,
                                ]}
                                onPress={handleSearchTeam}
                                disabled={
                                    inviteCode.trim().length === 0 ||
                                    isSearching ||
                                    isSubmitting
                                }
                            >
                                {isSearching ? (
                                    <ActivityIndicator color="#1A3A6B" />
                                ) : (
                                    <Text style={styles.searchButtonText}>
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
        paddingHorizontal: 24,
    },
    modalBox: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 22,
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
    },
    title: {
        color: "#000000",
        fontSize: 24,
        fontWeight: "700",
    },
    closeButton: {
        backgroundColor: "#FFFFFF",
    },
    tabContainer: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 22,
    },
    tabButton: {
        flex: 1,
        height: 46,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#1A3A6B",
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },
    activeTabButton: {
        backgroundColor: "#1A3A6B",
    },
    tabText: {
        color: "#A0A0A0",
        fontSize: 15,
    },
    activeTabText: {
        color: "#FFFFFF",
    },
    currentTeamBox: {
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#D7E0ED",
        backgroundColor: "#F7FAFF",
        marginBottom: 18,
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
        color: "#6F7785",
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 4,
    },
    currentTeamName: {
        color: "#111111",
        fontSize: 16,
        fontWeight: "800",
    },
    currentTeamCodeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
    },
    currentTeamCode: {
        color: "#1A3A6B",
        fontSize: 14,
        fontWeight: "800",
    },
    currentTeamActionRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 12,
    },
    currentTeamActionButton: {
        flex: 1,
        height: 40,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#D7E0ED",
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
    formGroup: {
        marginBottom: 16,
    },
    label: {
        color: "#333333",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: "#D9D9D9",
        borderRadius: 14,
        paddingHorizontal: 14,
        backgroundColor: "#FFFFFF",
        color: "#333333",
        fontSize: 15,
        marginBottom: -10,
    },
    noticeText: {
        color: "#A0A0A0",
        fontSize: 12,
    },
    searchButton: {
        height: 44,
        borderWidth: 1,
        borderColor: "#1A3A6B",
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 14,
        backgroundColor: "#FFFFFF",
    },
    searchButtonText: {
        color: "#1A3A6B",
        fontSize: 14,
        fontWeight: "700",
    },
    searchResultBox: {
        marginTop: 14,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#D7E0ED",
        backgroundColor: "#F7FAFF",
        gap: 8,
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
        color: "#6F7785",
        fontSize: 12,
        fontWeight: "600",
    },
    searchResultValue: {
        flex: 1,
        color: "#222222",
        fontSize: 13,
        fontWeight: "600",
        textAlign: "right",
    },
    searchResultCode: {
        color: "#1A3A6B",
        fontSize: 13,
        fontWeight: "800",
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
        borderWidth: 1,
        borderColor: "#D7E0ED",
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
        height: 55,
        backgroundColor: "#8C9CB5",
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 15,
    },
    disableButton: {
        backgroundColor: "#D9D9D9",
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});
