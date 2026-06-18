import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NAVY } from "../constants/mapConstants";

interface Props {
  latitude: number;
  longitude: number;
  address: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LocationConfirmCard({ latitude, longitude, address, onConfirm, onCancel }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.titleBar}>
        <Text style={styles.titleText}>위치 확인</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>이 위치가 맞습니까?</Text>
        <Text style={styles.address}>
          {address ?? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`}
        </Text>
        <View style={[styles.actions, { marginTop: 10 }]}>
          <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm} activeOpacity={0.85}>
            <Text style={styles.confirmText}>예</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dismissBtn} onPress={onCancel} activeOpacity={0.85}>
            <Text style={styles.dismissText}>아니요</Text>
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
