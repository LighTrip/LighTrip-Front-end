// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1a1a2e",
          borderTopWidth: 0,
          height: 70,
          borderRadius: 30,
          marginHorizontal: 16,
          marginBottom: 16,
          position: "absolute",
        },
        tabBarActiveTintColor: "#ff6b35",
        tabBarInactiveTintColor: "#666",
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
          tabBarIcon: ({ color }) => (
            <Ionicons name="id-card" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "프로필",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: () => (
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: "#ff6b35",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Ionicons name="map" size={28} color="white" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: "소셜",
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          title: "랭킹",
          tabBarIcon: ({ color }) => (
            <Ionicons name="trophy" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
