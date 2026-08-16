import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TopToastProps = {
    // null 이면 숨김. 같은 문구를 다시 띄우려면 먼저 null 로 되돌린다.
    message: string | null;
    onHide: () => void;
    duration?: number;
    topOffset?: number;
};

export default function TopToast({
    message,
    onHide,
    duration = 2000,
    topOffset = 8,
}: TopToastProps) {
    // 절대 위치라 부모 SafeAreaView 의 여백을 받지 못한다. 상태바 높이를 직접 더한다.
    const insets = useSafeAreaInsets();
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-12)).current;

    // 애니메이션 도중 onHide 가 바뀌어도 다시 시작되지 않도록 ref 로 들고 있는다.
    const onHideRef = useRef(onHide);
    onHideRef.current = onHide;

    useEffect(() => {
        if (!message) return;

        opacity.setValue(0);
        translateY.setValue(-12);

        const animation = Animated.sequence([
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 180,
                    useNativeDriver: true,
                }),
            ]),
            Animated.delay(duration),
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: -12,
                    duration: 220,
                    useNativeDriver: true,
                }),
            ]),
        ]);

        animation.start(({ finished }) => {
            if (finished) onHideRef.current();
        });

        return () => animation.stop();
    }, [message, duration, opacity, translateY]);

    if (!message) return null;

    return (
        <Animated.View
            // 토스트가 아래 버튼의 터치를 가로채면 안 된다.
            pointerEvents="none"
            style={[
                styles.toast,
                {
                    top: insets.top + topOffset,
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            <Ionicons name="information-circle" size={18} color="#FFFFFF" />
            <Text style={styles.text}>{message}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    toast: {
        position: "absolute",
        left: 20,
        right: 20,
        zIndex: 1000,
        elevation: 1000,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: "rgba(26, 58, 107, 0.95)",
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
    },
    text: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
});
