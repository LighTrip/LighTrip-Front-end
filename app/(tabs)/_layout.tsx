// app/(tabs)/_layout.tsx
import colors from "@/src/constant/colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background.nav,
          borderTopWidth: 0,
          height: 70,
          borderRadius: 30,
          marginHorizontal: 16,
          marginBottom: 16,
          position: "absolute",
        },
        tabBarActiveTintColor: colors.tab.active,
        tabBarInactiveTintColor: colors.tab.inactive,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="passport"
        options={{
          title: "여권",
          tabBarItemStyle: { marginTop: 10 },
          tabBarIcon: ({ color }) => (
            <Ionicons name="id-card" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "프로필",
          tabBarItemStyle: { marginTop: 10 },
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarItemStyle: { marginTop: 15 },
          tabBarIcon: () => (
            <View
              style={{
                width: 85,
                height: 55,
                borderRadius: 30,
                backgroundColor: colors.brand.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="map" size={28} color={colors.text.primary} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: "소셜",
          tabBarItemStyle: { marginTop: 10 },
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "둘러보기",
          tabBarItemStyle: { marginTop: 10 },
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
