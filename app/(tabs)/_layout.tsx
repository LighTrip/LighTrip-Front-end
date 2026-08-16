import LogoWhiteIcon from "@/assets/icons/logo-white.svg";
import LogoIcon from "@/assets/icons/logo.svg";
import {
  TeamModeProvider,
  useTeamMode,
} from "@/src/components/common/TeamModeContext";
import colors from "@/src/constant/colors";
import { emitMapTabPress } from "@/src/features/map/mapTabBus";
import { emitPassportTabPress } from "@/src/features/passport/passportTabBus";
import { emitProfileTabPress } from "@/src/features/profile/profileTabBus";
import { emitSearchTabPress } from "@/src/features/search/searchTabBus";
import { emitSocialTabPress } from "@/src/features/social/socialTabBus";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomTabBarProps,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import { Tabs, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SPRING = { damping: 18, stiffness: 200, mass: 0.8 };

type TabRoute = {
  name: string;
  icon: (color: string) => React.ReactNode;
  activeIcon?: () => React.ReactNode;
};

function getTabRoutes(isTeamMode: boolean): TabRoute[] {
  return [
    {
      name: "passport",
      icon: (c) => <Ionicons name="id-card" size={24} color={c} />,
    },
    {
      name: "profile",
      icon: (c) => <Ionicons name="person" size={24} color={c} />,
    },
    {
      name: "index",
      icon: () => <LogoIcon width={26} height={26} />,
      activeIcon: () => <LogoWhiteIcon width={26} height={26} />,
    },
    {
      name: "social",
      icon: (c) => <Ionicons name="people" size={24} color={c} />,
    },
    {
      name: "search",
      icon: (c) => (
        <Ionicons
          name={isTeamMode ? "people-circle" : "search"}
          size={24}
          color={c}
        />
      ),
    },
  ];
}

// 탭바 없이 전체 화면으로 보여 줄 하위 라우트
const FULL_SCREEN_ROUTES = ["profile/profileEdit"];

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { isTeamMode } = useTeamMode();

  const TAB_ROUTES = getTabRoutes(isTeamMode);
  const currentRouteName = state.routes[state.index]?.name;

  if (
    currentRouteName === "profile/privacy" ||
    currentRouteName === "profile/terms"
  ) {
    return null;
  }

  const visibleRoutes = state.routes.filter((r) =>
    TAB_ROUTES.some((t) => t.name === r.name),
  );
  const tabCount = visibleRoutes.length;
  const activeIndex = visibleRoutes.findIndex(
    (r) => r.key === state.routes[state.index]?.key,
  );

  const pillX = useSharedValue(activeIndex >= 0 ? activeIndex : 0);
  const [barWidth, setBarWidth] = useState(0);
  const [visualIndex, setVisualIndex] = useState(activeIndex >= 0 ? activeIndex : 0);

  useEffect(() => {
    if (activeIndex >= 0) {
      pillX.value = withSpring(activeIndex, SPRING);
      setVisualIndex(activeIndex);
    }
  }, [activeIndex]);

  const itemWidth = barWidth > 0 ? barWidth / tabCount : 0;
  const pillW = itemWidth * 0.82 + 4;
  const pillH = 46;

  // 전체 화면으로 쓰는 하위 페이지에서는 탭바를 감춘다.
  if (FULL_SCREEN_ROUTES.includes(currentRouteName)) {
    return null;
  }

  return (
    <View style={[styles.wrapper, { paddingBottom: Platform.OS === 'ios' ? bottom - 12 : bottom + 12 }]}>
      <View
        style={styles.bar}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      >
        {barWidth > 0 && (
          <Pill
            pillX={pillX}
            itemWidth={itemWidth}
            pillW={pillW}
            pillH={pillH}
          />
        )}

        {visibleRoutes.map((route, i) => {
          const tabDef = TAB_ROUTES.find((t) => t.name === route.name);
          if (!tabDef) return null;

          const isFocused = i === visualIndex;
          const options: BottomTabNavigationOptions =
            descriptors[route.key]?.options ?? {};

          const onPress = () => {
            if (route.name === "search" && isTeamMode) {
              pillX.value = withSpring(i, SPRING);
              setVisualIndex(i);
              router.push("/team");
              return;
            }
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
            >
              <TabIcon tabDef={tabDef} isFocused={isFocused} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Pill({
  pillX,
  itemWidth,
  pillW,
  pillH,
}: {
  pillX: SharedValue<number>;
  itemWidth: number;
  pillW: number;
  pillH: number;
}) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pillX.value * itemWidth + itemWidth / 2 - pillW / 2 },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.pill,
        { width: pillW, height: pillH, borderRadius: pillH / 2 },
        animStyle,
      ]}
    />
  );
}

function TabIcon({
  tabDef,
  isFocused,
}: {
  tabDef: TabRoute;
  isFocused: boolean;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.1 : 1, SPRING);
  }, [isFocused]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.iconWrap, animStyle]}>
      {isFocused && tabDef.activeIcon
        ? tabDef.activeIcon()
        : tabDef.icon(isFocused ? "#FFFFFF" : "#888888")}
    </Animated.View>
  );
}

function TabsLayoutContent() {
  const router = useRouter();
  const { isTeamMode } = useTeamMode();
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="passport"
        options={{ title: "여권" }}
        listeners={{
          tabPress: () => {
            emitPassportTabPress();
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "프로필" }}
        listeners={{
          tabPress: () => {
            emitProfileTabPress();
          },
        }}
      />
      <Tabs.Screen
        name="index"
        options={{ title: "지도" }}
        listeners={{
          tabPress: () => {
            emitMapTabPress();
          },
        }}
      />
      <Tabs.Screen
        name="social"
        options={{ title: "소셜" }}
        listeners={{
          tabPress: () => {
            emitSocialTabPress();
          },
        }}
      />
      <Tabs.Screen
        name="search"
        options={{ title: isTeamMode ? "팀" : "둘러보기" }}
        listeners={{
          tabPress: (e) => {
            if (isTeamMode) {
              e.preventDefault();
              router.push("/team");
            } else {
              emitSearchTabPress();
            }
          },
        }}
      />
      <Tabs.Screen name="profile/profileEdit" options={{ href: null }} />
      <Tabs.Screen name="profile/scrap" options={{ href: null }} />
      <Tabs.Screen name="profile/privacy" options={{ href: null }} />
      <Tabs.Screen name="profile/terms" options={{ href: null }} />
      <Tabs.Screen name="profile/subscribe" options={{ href: null }} />
    </Tabs>
  );
}
export default function TabLayout() {
  return (
    <TeamModeProvider>
      <TabsLayoutContent />
    </TeamModeProvider>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 9 },
  },
  bar: {
    flexDirection: "row",
    height: 58,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    alignItems: "center",
    elevation: 5,
    overflow: "hidden",
  },
  pill: {
    position: "absolute",
    backgroundColor: colors.brand.primary,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});

