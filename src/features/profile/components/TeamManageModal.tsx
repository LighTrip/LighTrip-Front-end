import { createTeam, joinTeam } from "@/src/api/profileApi";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type TeamManageModalProps = {
    visible: boolean;
    onClose: () => void;
}

type TeamMode = "create" | "join"

export default function TeamManageModal({
    visible,
    onClose,
} : TeamManageModalProps) {

    const [mode, setMode] = useState<TeamMode>("create");

    const [teamName, setTeamName] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isCreateMode = mode === "create";

    // 팀 생성/팀 가입 호출
    const handleSubmit = async () => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            if(isCreateMode) {
                const trimmedTeamName = teamName.trim();

                const result = await createTeam(trimmedTeamName);

                Alert.alert(
                    "팀 생성 완료",
                    `${result.teamName} 팀이 생성되었습니다.\n팀 코드: ${result.teamCode}`
                );

                setTeamName("");
                onClose();
                return;
            }

            const trimmedTeamCode = inviteCode.trim();

            const result = await joinTeam(trimmedTeamCode);

            Alert.alert(
                "팀 가입 완료",
                `${result.teamName} 팀에 가입되었습니다.`
            )

            setInviteCode("");
            onClose();
        } catch(error) {
            console.log("팀 처리 에러:", error);

            Alert.alert(
                isCreateMode ? "팀 생성 실패" : "팀 가입 실패",
                error instanceof Error
                    ? error.message
                    : "팀 처리 중 문제가 발생했습니다."
            );
        }finally {
            setIsSubmitting(false);
        }
    }


    const isDisabled = isCreateMode
        ? teamName.trim().length === 0 || isSubmitting
        : inviteCode.trim().length === 0 || isSubmitting;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.modalBox} onPress={() => {}}>
                    <View style={styles.header}>
                        <Text style={styles.title}>팀 관리</Text>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={onClose}
                            style={styles.closeButton}
                            disabled={isSubmitting}
                        >
                            <Ionicons name="close" size={22} color="#333333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tabContainer}>
                        {/*팀 생성 tab*/}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[
                                styles.tabButton,
                                isCreateMode && styles.activeTabButton,
                            ]}
                            onPress={() => setMode("create")}
                            disabled={isSubmitting}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    isCreateMode && styles.activeTabText
                                ]}
                            >
                                팀 만들기
                            </Text>
                        </TouchableOpacity>

                        {/*팀 가입 tab*/}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[
                                styles.tabButton,
                                !isCreateMode && styles.activeTabButton,
                            ]}
                            onPress={() => setMode("join")}
                            disabled={isSubmitting}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    !isCreateMode && styles.activeTabText
                                ]}
                            >
                                팀 가입하기
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {isCreateMode ? (
                        // 팀 생성
                        <View>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>팀 이름</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="팀 이름을 입력해주세요"
                                    placeholderTextColor="#A0A0A0"
                                    value={teamName}
                                    onChangeText={setTeamName}
                                    editable={!isSubmitting}
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
                        // 팀 가입
                        <View>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>초대 코드</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="초대 코드를 입력해주세요"
                                    placeholderTextColor="#A0A0A0"
                                    value={inviteCode}
                                    onChangeText={setInviteCode}
                                    autoCapitalize="characters"
                                    editable={!isSubmitting}
                                />
                            </View>

                            <Text style={styles.noticeText}>
                                팀 생성자로부터 받은 코드를 입력하세요.
                            </Text>

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
    )
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
        alignItems:"center",
        marginBottom: 18,
    },
    title: {
        color: "#000000",
        fontSize: 24,
        fontWeight: "700",
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
    closeButton: {
        backgroundColor: "#FFFFFF",
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
        borderColor: "#d9d9d9",
        borderRadius: 14,
        paddingHorizontal: 14,
        backgroundColor: "#FFFFFF",
        color: "#A0A0A0",
        fontSize: 15,
        marginBottom: -10,
    },
    noticeText: {
        color: "#A0A0A0",
        fontSize: 12,
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
        backgroundColor: "#d9d9d9"
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    }
})