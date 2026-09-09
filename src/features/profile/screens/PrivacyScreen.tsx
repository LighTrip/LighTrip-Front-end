import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
    BackHandler,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PolicyContentView from "../components/PolicyContentView";
import {
    privacyContent,
    privacyIntro,
    privacyMeta,
} from "../data/policyContent";

export default function PrivacyScreen() {
  const router = useRouter();

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/profile" as any);
        return true;
      },
    );

    return () => subscription.remove();
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => router.replace("/profile" as any)}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>개인정보처리방침</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <PolicyContentView
          title={privacyMeta.title}
          intro={privacyIntro}
          noticeDate={privacyMeta.noticeDate}
          effectiveDate={privacyMeta.effectiveDate}
          blocks={privacyContent}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A3A6B",
  },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    backgroundColor: "#1A3A6B",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 40,
  },
  body: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  bodyContent: {
    paddingBottom: 40,
  },
});
