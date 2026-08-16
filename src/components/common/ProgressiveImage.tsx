import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Image,
    ImageProps,
    LayoutChangeEvent,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";

type ProgressiveImageProps = Omit<ImageProps, "style"> & {
    style?: ViewStyle | ViewStyle[];
};

/**
 * 이미지가 도착할 때까지 스켈레톤(좌우로 흐르는 하이라이트)을 보여 주고,
 * 다 받으면 부드럽게 페이드인한다. 원격 이미지가 큰 화면에서 빈 회색 칸이 뜨는 걸 막는다.
 */
export default function ProgressiveImage({
    style,
    onLoadEnd,
    ...imageProps
}: ProgressiveImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [width, setWidth] = useState(0);

    const fadeIn = useRef(new Animated.Value(0)).current;
    const shimmer = useRef(new Animated.Value(0)).current;

    // 로딩이 끝날 때까지 하이라이트를 계속 흘려보낸다.
    useEffect(() => {
        if (isLoaded) return;

        const loop = Animated.loop(
            Animated.timing(shimmer, {
                toValue: 1,
                duration: 1100,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        );

        loop.start();

        return () => loop.stop();
    }, [isLoaded, shimmer]);

    useEffect(() => {
        if (!isLoaded) return;

        Animated.timing(fadeIn, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
        }).start();
    }, [isLoaded, fadeIn]);

    const handleLayout = (event: LayoutChangeEvent) => {
        setWidth(event.nativeEvent.layout.width);
    };

    const translateX = shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width],
    });

    return (
        <View style={[styles.container, style]} onLayout={handleLayout}>
            {!isLoaded && (
                <View style={styles.skeleton}>
                    {width > 0 && (
                        <Animated.View
                            style={[
                                StyleSheet.absoluteFill,
                                { transform: [{ translateX }] },
                            ]}
                        >
                            <LinearGradient
                                colors={[
                                    "rgba(255, 255, 255, 0)",
                                    "rgba(255, 255, 255, 0.65)",
                                    "rgba(255, 255, 255, 0)",
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                        </Animated.View>
                    )}
                </View>
            )}

            <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeIn }]}>
                <Image
                    {...imageProps}
                    style={StyleSheet.absoluteFill}
                    onLoadEnd={() => {
                        setIsLoaded(true);
                        onLoadEnd?.();
                    }}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: "hidden",
        backgroundColor: "#EDF1F7",
    },
    skeleton: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#E4EAF2",
    },
});
