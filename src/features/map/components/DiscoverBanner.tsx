import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NAVY } from "../constants/mapConstants";

interface Props {
  address: string | null;
  onDismiss: () => void;
  onRegister: () => void;
}

export function DiscoverBanner({ address, onDismiss, onRegister }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.titleBar}>
        <Text style={styles.titleText}>현재 위치</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>새로운 장소를 발견하셨나요?</Text>
        {address && <Text style={styles.address}>{address}</Text>}
        <View style={[styles.actions, { marginTop: 10 }]}>
          <TouchableOpacity style={styles.confirmBtn} onPress={onRegister} activeOpacity={0.85}>
            <Text style={styles.confirmText}>여권 등록하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss} activeOpacity={0.85}>
            <Text style={styles.dismissText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "white", borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  titleBar: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", alignItems: "center" },
  titleText: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  body: { paddingVertical: 20, paddingHorizontal: 20, alignItems: "center", gap: 6 },
  title: { fontSize: 17, fontWeight: "700", color: "#1E293B" },
  address: { fontSize: 13, color: "#64748B", textAlign: "center" },
  actions: { flexDirection: "row", gap: 10, width: "100%" },
  confirmBtn: { flex: 1, backgroundColor: NAVY, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  confirmText: { color: "white", fontWeight: "700", fontSize: 15 },
  dismissBtn: { flex: 0.5, backgroundColor: "#F1F5F9", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  dismissText: { color: "#475569", fontWeight: "600", fontSize: 15 },
});
