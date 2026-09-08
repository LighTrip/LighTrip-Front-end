import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { createPassportReport, type ReportReason } from "@/src/api/report/report.api";

const SCREEN_HEIGHT = Dimensions.get("window").height;

type ReportReasonOption = {
    value: ReportReason;
    label: string;
};

const REPORT_REASON_OPTIONS: ReportReasonOption[] = [
    { value: "SPAM", label: "스팸 홍보/도배" },
    { value: "ABUSE", label: "욕설/혐오 발언" },
    { value: "SEXUAL", label: "음란물/선정적 콘텐츠" },
    { value: "COPYRIGHT", label: "저작권 침해" },
    { value: "FALSE_INFO", label: "허위 정보" },
    { value: "ETC", label: "기타" },
];

type ReportModalProps = {
    visible: boolean;
    onClose: () => void;
    passportId: number;
    targetNickname?: string;
};

export default function ReportModal({
    visible,
    onClose,
    passportId,
    targetNickname,
}: ReportModalProps) {
    const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
    const [detail, setDetail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // 뒷배경(overlay)은 페이드로, 시트는 슬라이드로 — 서로 다른 값이라 따로 움직여야 한다.
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    // 모달을 다시 열 때마다 이전 선택이 남아있지 않도록 초기화하고, 올라오는 애니메이션을 재생한다.
    useEffect(() => {
        if (!visible) return;

        setSelectedReason(null);
        setDetail("");
        setErrorMessage("");

        overlayOpacity.setValue(0);
        sheetTranslateY.setValue(SCREEN_HEIGHT);

        Animated.parallel([
            Animated.timing(overlayOpacity, {
                toValue: 1,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.timing(sheetTranslateY, {
                toValue: 0,
                duration: 260,
                useNativeDriver: true,
            }),
        ]).start();
    }, [visible]);

    // 닫을 때도 내려가는 모션을 먼저 보여준 뒤 실제로 언마운트한다.
    const handleClose = () => {
        Animated.parallel([
            Animated.timing(overlayOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(sheetTranslateY, {
                toValue: SCREEN_HEIGHT,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose();
        });
    };

    const handleSelectReason = (reason: ReportReason) => {
        setSelectedReason(reason);
        setErrorMessage("");
    };

    const handleSubmit = async () => {
        if (!selectedReason) {
            setErrorMessage("신고 사유를 선택해주세요.");
            return;
        }

        if (selectedReason === "ETC" && detail.trim().length === 0) {
            setErrorMessage("신고 내용을 입력해주세요.");
            return;
        }

        try {
            setIsSubmitting(true);
            setErrorMessage("");

            await createPassportReport(passportId, {
                reason: selectedReason,
                detail: detail.trim() || null,
            });

            Alert.alert("신고 접수 완료", "신고가 접수되었습니다. 검토 후 조치할게요.");
            handleClose();
        } catch (error) {
            console.log("사용자 신고 에러:", error);

            if (error instanceof Error) {
                Alert.alert("신고 실패", error.message);
            } else {
                Alert.alert("신고 실패", "알 수 없는 오류가 발생했습니다.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
        >
            <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
                <TouchableOpacity
                    style={styles.overlayTouchable}
                    activeOpacity={1}
                    onPress={handleClose}
                />
            </Animated.View>

            <Animated.View
                style={[
                    styles.bottomSheet,
                    { transform: [{ translateY: sheetTranslateY }] },
                ]}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>신고하기</Text>
                        {targetNickname ? (
                            <Text style={styles.subTitle}>{targetNickname}님의 게시물을 신고합니다</Text>
                        ) : null}
                    </View>

                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Ionicons name="close" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <Text style={styles.sectionLabel}>신고 사유를 선택해주세요</Text>

                    {REPORT_REASON_OPTIONS.map((option) => {
                        const isSelected = selectedReason === option.value;

                        return (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.reasonRow}
                                activeOpacity={0.7}
                                onPress={() => handleSelectReason(option.value)}
                            >
                                <Ionicons
                                    name={isSelected ? "radio-button-on" : "radio-button-off"}
                                    size={20}
                                    color={isSelected ? "#1A3A6B" : "#B0B7C3"}
                                />
                                <Text style={styles.reasonText}>{option.label}</Text>
                            </TouchableOpacity>
                        );
                    })}

                    {selectedReason === "ETC" && (
                        <TextInput
                            style={styles.detailInput}
                            placeholder="신고 내용을 입력해주세요"
                            placeholderTextColor="#B0B7C3"
                            value={detail}
                            onChangeText={setDetail}
                            multiline
                            maxLength={500}
                        />
                    )}

                    {errorMessage.length > 0 && (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    )}

                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                        activeOpacity={0.85}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>신고하기</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.35)",
    },
    overlayTouchable: {
        flex: 1,
    },
    bottomSheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: "hidden",
    },
    header: {
        backgroundColor: "#1A3A6B",
        paddingHorizontal: 20,
        paddingTop: 22,
        paddingBottom: 18,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    subTitle: {
        fontSize: 13,
        color: "#FFFFFF",
        marginTop: 6,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 28,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333333",
        marginBottom: 12,
    },
    reasonRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 10,
    },
    reasonText: {
        fontSize: 15,
        color: "#333333",
    },
    detailInput: {
        marginTop: 8,
        minHeight: 72,
        borderWidth: 1,
        borderColor: "#D1D5DC",
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: "#000000",
        textAlignVertical: "top",
    },
    errorText: {
        marginTop: 12,
        fontSize: 13,
        color: "#ED3838",
    },
    submitButton: {
        marginTop: 20,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#ED3838",
        alignItems: "center",
        justifyContent: "center",
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },
});
