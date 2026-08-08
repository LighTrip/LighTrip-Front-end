import { useEffect, useRef, useState } from "react";
import {
    Animated,
    LayoutChangeEvent,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { SearchTab } from "../types/search.types";

type SearchToggleProps = {
    selectedTab: SearchTab;
    onChangeTab: (tab: SearchTab) => void;
}

type TabLayout = {
    x: number;
    width: number;
}

export default function SearchToggle({selectedTab, onChangeTab}: SearchToggleProps) {
    const progress = useRef(
        new Animated.Value(selectedTab === "ranking" ? 1 : 0),
    ).current;
    const [tabLayouts, setTabLayouts] = useState<
        Partial<Record<SearchTab, TabLayout>>
    >({});

    const isReady = !!tabLayouts.all && !!tabLayouts.ranking;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: selectedTab === "ranking" ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [selectedTab, progress]);

    const handleTabLayout =
        (tab: SearchTab) => (event: LayoutChangeEvent) => {
            const { x, width } = event.nativeEvent.layout;

            setTabLayouts((prev) => {
                const prevLayout = prev[tab];

                if (
                    prevLayout &&
                    prevLayout.x === x &&
                    prevLayout.width === width
                ) {
                    return prev;
                }

                return { ...prev, [tab]: { x, width } };
            });
        };

    const pillStyle = isReady
        ? {
              left: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [tabLayouts.all!.x, tabLayouts.ranking!.x],
              }),
              width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                      tabLayouts.all!.width,
                      tabLayouts.ranking!.width,
                  ],
              }),
          }
        : null;

    const allTextColor = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ["#FFFFFF", "#000000"],
    });
    const rankingTextColor = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ["#000000", "#FFFFFF"],
    });

    return (
        <View style={styles.toggleBox}>
            {isReady && <Animated.View style={[styles.pill, pillStyle]} />}

            <TouchableOpacity
                style={[
                    styles.toggleButton,
                    !isReady && selectedTab === "all" && styles.activeToggle,
                ]}
                activeOpacity={0.8}
                onLayout={handleTabLayout("all")}
                onPress={() => onChangeTab("all")}
            >
                <Animated.Text
                    style={[styles.toggleText, { color: allTextColor }]}
                >
                    전체
                </Animated.Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.toggleButton,
                    !isReady &&
                        selectedTab === "ranking" &&
                        styles.activeToggle,
                ]}
                activeOpacity={0.8}
                onLayout={handleTabLayout("ranking")}
                onPress={() => onChangeTab("ranking")}
            >
                <Animated.Text
                    style={[styles.toggleText, { color: rankingTextColor }]}
                >
                    랭킹
                </Animated.Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    toggleBox: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        borderColor: "#c6c6c6",
        borderWidth: 2.5,
    },
    pill: {
        position: "absolute",
        top: 0,
        bottom: 0,
        borderRadius: 18,
        backgroundColor: "#1A3A6B",
    },
    toggleButton: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 18,
    },
    activeToggle: {
        backgroundColor: "#1A3A6B",
    },
    toggleText: {
        fontSize: 12,
        fontWeight: "500",
    },
})
