import EtcIcon from "@/assets/icons/etc.svg";
import { ClusterDetailItem } from "@/src/api/lights.api";
import { useEffect, useRef } from "react";
import { Animated, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../constants/mapConstants";

interface Props {
  items: ClusterDetailItem[] | null;
  onClose: () => void;
  onSelectItem: (item: ClusterDetailItem) => void;
}

export function ClusterBottomSheet({ items, onClose, onSelectItem }: Props) {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (items) {
      Animated.spring(slideAnim, { toValue: 1, tension: 65, friction: 11, useNativeDriver: true }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [items]);

  if (!items) return null;

  return (
    <Modal visible={!!items} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View
        style={[
          styles.container,
          { transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) }] },
        ]}
      >
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>이 근처 장소 {items.length}곳</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {items.map((item, idx) => (
            <TouchableOpacity
              key={`sheet-item-${item.passportId ?? idx}`}
              style={styles.item}
              activeOpacity={0.75}
              onPress={() => onSelectItem(item)}
            >
              <View style={styles.itemIcon}>
                {(() => {
                  const Icon = CATEGORY_ICONS[item.category] ?? EtcIcon;
                  return <Icon width={24} height={24} fill={(CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.ETC).main} />;
                })()}
              </View>
              <View style={styles.itemBody}>
                <Text style={styles.itemName} numberOfLines={1}>{item.spaceName}</Text>
              </View>
              <Text style={styles.itemChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)" },
  container: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: "65%",
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: -4 }, elevation: 12,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#D1D5DB", alignSelf: "center", marginTop: 12, marginBottom: 4 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F0FDF4" },
  title: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  closeText: { fontSize: 16, color: "#94A3B8", padding: 4 },
  scroll: { flexGrow: 0 },
  scrollContent: { paddingBottom: 32, paddingTop: 4 },
  item: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F8FAFC", gap: 14 },
  itemIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(156, 163, 175, 0.15)", justifyContent: "center", alignItems: "center" },
  itemBody: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  itemChevron: { fontSize: 20, color: "#BBF7D0", fontWeight: "300" },
});
