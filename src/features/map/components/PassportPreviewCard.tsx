import EtcIcon from "@/assets/icons/etc.svg";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CATEGORY_COLORS, CATEGORY_ICONS, GREEN_MID } from "../constants/mapConstants";
import { PassportPreview } from "../types/map.types";

interface Props {
  preview: PassportPreview | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onOpenDetail: () => void;
}

export function PassportPreviewCard({ preview, loading, error, onClose, onOpenDetail }: Props) {
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={12}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color={GREEN_MID} />
          <Text style={styles.loadingText}>불러오는 중...</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {preview && !loading && (
        <>
          {preview.imageUrl ? (
            <Image source={{ uri: preview.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>🖼️</Text>
            </View>
          )}
          <View style={styles.body}>
            <View style={styles.nameRow}>
              {(() => {
                const Icon = CATEGORY_ICONS[preview.category] ?? EtcIcon;
                const color = (CATEGORY_COLORS[preview.category] ?? CATEGORY_COLORS.ETC).main;
                return <Icon width={18} height={18} fill={color} />;
              })()}
              <Text style={styles.placeName} numberOfLines={1}>{preview.spaceName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowIcon}>📍</Text>
              <Text style={styles.rowText} numberOfLines={1}>{preview.address}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowIcon}>🗓</Text>
              <Text style={styles.rowText}>{preview.visitedAt}</Text>
            </View>
            {preview.musicTitle && (
              <View style={styles.row}>
                <Text style={styles.rowIcon}>🎵</Text>
                <Text style={styles.rowText} numberOfLines={1}>
                  {preview.musicTitle}{preview.musicArtist ? ` — ${preview.musicArtist}` : ""}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.detailBtn} activeOpacity={0.85} onPress={onOpenDetail}>
              <Text style={styles.detailBtnText}>여권 상세보기</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "white", borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  closeBtn: { position: "absolute", top: 12, right: 14, zIndex: 10, padding: 4 },
  closeText: { fontSize: 16, color: "#94A3B8" },
  center: { paddingVertical: 32, alignItems: "center", gap: 8 },
  loadingText: { fontSize: 13, color: "#94A3B8", marginTop: 6 },
  errorText: { fontSize: 13, color: "#EF4444" },
  image: { width: "100%", height: 160 },
  imagePlaceholder: { width: "100%", height: 120, backgroundColor: "#F0FDF4", justifyContent: "center", alignItems: "center" },
  imagePlaceholderText: { fontSize: 36 },
  body: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 16, gap: 6 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  placeName: { fontSize: 16, fontWeight: "700", color: "#1E293B", flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 7 },
  rowIcon: { fontSize: 13 },
  rowText: { fontSize: 13, color: "#475569", flexShrink: 1 },
  detailBtn: { marginTop: 12, backgroundColor: GREEN_MID, paddingVertical: 13, borderRadius: 12, alignItems: "center" },
  detailBtnText: { color: "white", fontWeight: "700", fontSize: 14 },
});
