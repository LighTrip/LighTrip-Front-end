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

const BORDER_WIDTH = 2.5;
const OUTER_RADIUS = 20;

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

    // 버튼 좌표는 track 기준이고 pill 도 track 안의 절대 위치라 그대로 대응된다.
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
            {/* 테두리가 없는 track 을 따로 둔다.
                toggleBox 처럼 borderWidth 가 있는 뷰에 pill 을 직접 얹으면
                버튼의 onLayout x(테두리가 이미 반영된 값)에 테두리 두께가 한 번 더 더해져
                pill 이 버튼과 어긋난다. */}
            <View style={styles.track}>
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
        </View>
    )
}

const styles = StyleSheet.create({
    toggleBox: {
        backgroundColor: "#FFFFFF",
        borderRadius: OUTER_RADIUS,
        borderColor: "#c6c6c6",
        borderWidth: BORDER_WIDTH,
    },
    track: {
        flexDirection: "row",
        // 테두리 안쪽 곡률에 맞춰 pill 이 모서리를 삐져나오지 않도록 잘라낸다.
        borderRadius: OUTER_RADIUS - BORDER_WIDTH,
        overflow: "hidden",
    },
    pill: {
        position: "absolute",
        top: 0,
        bottom: 0,
        borderRadius: 999,
        backgroundColor: "#1A3A6B",
    },
    toggleButton: {
        // 라벨 길이가 달라도 두 탭 폭을 같게 맞춘다.
        minWidth: 54,
        paddingHorizontal: 12,
        paddingVertical: 5,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
    },
    activeToggle: {
        backgroundColor: "#1A3A6B",
    },
    toggleText: {
        fontSize: 12,
        fontWeight: "500",
    },
})
