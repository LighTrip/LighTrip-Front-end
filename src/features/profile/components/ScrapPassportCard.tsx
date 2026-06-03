import type { ScrapPassport } from "@/src/api/list/scrap.api";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ScrapPassportCardProps = {
    item: ScrapPassport;
    onPress: (passportId: number) => void;
};

// 날짜 추출
const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if(Number.isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}.${month}.${day}`;
};

export default function ScrapPassportCard({
    item,
    onPress
}: ScrapPassportCardProps) {
    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => onPress(item.passportId)}
        >
            <View style={styles.thumbnailBox}>
                {item.thumbnailUrl ? (
                    <Image
                        source={{uri: item.thumbnailUrl}}
                        style={styles.thumbnail}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.emptyThumbnail}>
                        <Ionicons name="image-outline" size={36} color="#9CA3AF" />
                    </View>
                )}

                <View style={styles.dateBadge}>
                    <Text style={styles.dateText}>
                        저장일 {formatDate(item.scrapCreatedAt)}
                    </Text>
                </View>
            </View>

            <View style={styles.infoBox}>
                <View style={styles.titleRow}>
                    <Ionicons name="location" size={20} color="#1A3A6B" />
                    <Text style={styles.spaceName} numberOfLines={1}>
                        {item.spaceName}
                    </Text>
                </View>

                <Text style={styles.address} numberOfLines={1}>
                    {item.address}
                </Text>

                <Text style={styles.content} numberOfLines={1}>
                    {item.content}
                </Text>

                <View style={styles.divider} />

                <View style={styles.bottomRow}>
                    <View style={styles.countBox}>
                        <Ionicons name="heart" size={20} color="#FF7A8A" />
                        <Text style={styles.countText}>{item.likeCount}</Text>
                    </View>
                    <View style={styles.countBox}>
                        <Ionicons name="bookmark" size={20} color="#1A3A6B" />
                        <Text style={styles.countText}>{item.scrapCount}</Text>
                    </View>

                    <Ionicons
                        name="chevron-forward"
                        size={22}
                        color="#9CA3AF"
                        style={styles.chevron}
                    />
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        marginBottom: 18,
        overflow: "hidden",

        shadowColor: "#4C4C4C",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.16,
        shadowRadius: 10,
        elevation: 5,
    },
    thumbnailBox: {
        width: "100%",
        height: 155,
        backgroundColor: "#E5E7EB",
        position: "relative",
    },
    thumbnail: {
        width: "100%",
        height: "100%",
    },
    emptyThumbnail: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F1F5F9",
    },
    dateBadge: {
        position: "absolute",
        top: 12,
        right: 12,
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6
    },
    dateText: {
        color: "#333333",
        fontSize: 12,
        fontWeight: "600",
    },
    infoBox: {
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    spaceName: {
        color: "#111827",
        fontSize: 18,
        fontWeight: "700",
        marginLeft: 6,
        flex: 1,
    },
    address: {
        color: "#6B7280",
        fontSize: 13,
        marginBottom: 10,
    },
    content: {
        color: "#374151",
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginBottom: 10,
    },
    bottomRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    countBox: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 18,
    },
    countText: {
        color: "#333333",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 6,
    },
    chevron: {
        marginLeft: "auto",
    }
})