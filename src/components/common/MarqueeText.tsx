import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    LayoutChangeEvent,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";

type MarqueeTextProps = {
    children: string;
    style?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    // 초당 이동 픽셀. 값이 클수록 빨리 흐른다.
    speed?: number;
    // 한 바퀴 돌기 전 멈춰 있는 시간(ms). 글자를 읽을 여유를 준다.
    pauseDuration?: number;
    // 반복될 때 두 문구 사이 간격
    gap?: number;
};

/**
 * 글자가 칸보다 길면 옆으로 흘려보내고, 짧으면 그냥 보여 준다.
 * 잘라내기(...) 대신 전체 내용을 다 읽을 수 있게 하려는 용도.
 */
export default function MarqueeText({
    children,
    style,
    containerStyle,
    speed = 30,
    pauseDuration = 1200,
    gap = 32,
}: MarqueeTextProps) {
    const [containerWidth, setContainerWidth] = useState(0);
    const [textWidth, setTextWidth] = useState(0);

    const translateX = useRef(new Animated.Value(0)).current;

    const isOverflowing =
        containerWidth > 0 && textWidth > 0 && textWidth > containerWidth + 1;
    const scrollDistance = textWidth + gap;

    useEffect(() => {
        if (!isOverflowing) {
            translateX.setValue(0);
            return;
        }

        translateX.setValue(0);

        const animation = Animated.loop(
            Animated.sequence([
                Animated.delay(pauseDuration),
                Animated.timing(translateX, {
                    toValue: -scrollDistance,
                    // 길이에 상관없이 같은 속도로 흐르게 시간을 계산한다.
                    duration: (scrollDistance / speed) * 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ]),
        );

        animation.start();

        return () => animation.stop();
    }, [isOverflowing, scrollDistance, speed, pauseDuration, translateX]);

    const handleContainerLayout = (event: LayoutChangeEvent) => {
        setContainerWidth(event.nativeEvent.layout.width);
    };

    const handleMeasureLayout = (event: LayoutChangeEvent) => {
        const measured = event.nativeEvent.layout.width;

        setTextWidth((prev) => (Math.abs(prev - measured) < 1 ? prev : measured));
    };

    return (
        <View
            style={[styles.container, containerStyle]}
            onLayout={handleContainerLayout}
        >
            {/* 글자의 진짜 폭을 재기 위한 사본.
                좁은 칸 안에서 그냥 재면 잘린 폭이 나오므로,
                넉넉한 폭을 가진 절대 위치 상자 안에서 줄바꿈 없이 재야 한다. */}
            <View style={styles.measureBox} pointerEvents="none">
                <Text style={style} onLayout={handleMeasureLayout}>
                    {children}
                </Text>
            </View>

            <Animated.View
                style={[
                    styles.track,
                    isOverflowing && { transform: [{ translateX }] },
                ]}
            >
                <Text
                    style={[
                        style,
                        // 폭을 못 박아야 좁은 칸에 맞춰 줄어들지 않는다.
                        isOverflowing ? { width: textWidth } : null,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="clip"
                >
                    {children}
                </Text>

                {/* 끊김 없이 이어 붙기 위한 두 번째 사본 */}
                {isOverflowing && (
                    <Text
                        style={[style, { width: textWidth, marginLeft: gap }]}
                        numberOfLines={1}
                        ellipsizeMode="clip"
                    >
                        {children}
                    </Text>
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: "hidden",
    },
    measureBox: {
        position: "absolute",
        top: 0,
        left: 0,
        // 줄바꿈 없이 한 줄로 펼쳐지도록 충분히 넓게 잡는다. opacity 0 이라 보이지 않는다.
        width: 4000,
        opacity: 0,
        flexDirection: "row",
    },
    track: {
        flexDirection: "row",
    },
});
