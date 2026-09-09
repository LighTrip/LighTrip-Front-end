import PassportFrame from "@/src/features/search/components/PassportFrame";
import type { PublicUserProfile } from "@/src/features/social/types/social.types";
import { scaleH } from "@/src/utils/scale";
import { Ionicons } from "@expo/vector-icons";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 둘러보기 피드 카드와 같은 크기·구조로 맞춘다.
const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = scaleH(650);

type PassportCardViewProps = {
    // 여권 상세 조회 응답
    passport: any;
    // 작성자 정보는 여권 상세 응답에 없어서 호출하는 쪽이 따로 받아 넘긴다.
    writer: PublicUserProfile | null;
    onClose: () => void;
};

// 남의 여권(스크랩·좋아요)을 둘러보기 피드와 같은 모습으로 펼쳐 보여 준다.
// 편집 UI가 있는 PassportDetail은 내 여권 전용이라 여기서는 쓰지 않는다.
export default function PassportCardView({
    passport,
    writer,
    onClose,
}: PassportCardViewProps) {
    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <View style={styles.body}>
                <View style={styles.cardShadow}>
                    <View style={styles.card}>
                        <Image
                            source={require("@/assets/images/noise.png")}
                            style={styles.noise}
                            resizeMode="cover"
                        />

                        <View style={styles.cardContent}>
                            <View style={styles.writerArea}>
                                <View style={styles.writerRow}>
                                    <Image
                                        source={
                                            writer?.profileImg
                                                ? { uri: writer.profileImg }
                                                : require("@/assets/images/default_profile.png")
                                        }
                                        style={styles.writerImage}
                                    />

                                    <View style={styles.writerTextArea}>
                                        <View style={styles.writerNameRow}>
                                            <Text style={styles.writerName}>
                                                {writer?.nickname ?? "알 수 없는 사용자"}
                                            </Text>
                                            <Text style={styles.writerId}>
                                                #{passport.userId}
                                            </Text>
                                        </View>

                                        <View style={styles.writerLocationRow}>
                                            <Ionicons
                                                name="location-outline"
                                                size={12}
                                                color="#666667"
                                            />
                                            <Text style={styles.writerLocation}>
                                                {passport.district}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.passportArea}>
                                <PassportFrame
                                    item={{
                                        imageUrls: passport.imageUrls ?? [],
                                        content: passport.content,
                                        spaceName: passport.spaceName,
                                        category: passport.category,
                                        visitedAt: passport.visitedAt,
                                        musicTitle: passport.musicTitle,
                                        musicArtist: passport.musicArtist,
                                    }}
                                />
                            </View>
                        </View>

                        {/* 여권 안쪽 우상단. 작성자 영역의 빈 오른쪽 자리에 얹는다. */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            activeOpacity={0.8}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            onPress={onClose}
                        >
                            <Ionicons name="close" size={24} color="#111827" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFD",
    },
    closeButton: {
        position: "absolute",
        top: 10,
        right: 10,
        width: 36,
        height: 36,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2,
    },
    body: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        // 탭바가 화면 위에 떠 있어서, 그만큼 비워 두고 가운데를 잡는다.
        paddingBottom: 90,
    },
    // overflow: "hidden"인 카드는 자기 그림자까지 잘라내므로, 피드와 마찬가지로
    // 그림자는 이 바깥 뷰가 갖는다.
    cardShadow: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 16,
        backgroundColor: "#F8FAFD",
        shadowColor: "#707070",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    card: {
        width: "100%",
        height: "100%",
        borderRadius: 16,
        overflow: "hidden",
    },
    noise: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 0,
    },
    cardContent: {
        position: "relative",
        flex: 1,
        zIndex: 1,
    },
    writerArea: {
        paddingHorizontal: 22,
        paddingTop: 22,
        height: 90,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    writerRow: {
        flexDirection: "row",
        alignItems: "center",
        // 닉네임이 길어도 우상단 닫기 버튼 밑으로 파고들지 않게 한다.
        paddingRight: 30,
    },
    writerImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    writerTextArea: {
        flex: 1,
        marginLeft: 12,
    },
    writerNameRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    writerName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#000000",
    },
    writerId: {
        marginLeft: 5,
        marginTop: 5,
        fontSize: 14,
        fontWeight: "500",
        color: "#666667",
    },
    writerLocationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    writerLocation: {
        marginLeft: 2,
        fontSize: 10,
        color: "#666667",
    },
    // PassportFrame이 height: "100%"로 채우므로 이 영역이 높이를 갖고 있어야 한다.
    passportArea: {
        position: "relative",
        width: "100%",
        flex: 1,
        marginTop: 10,
        borderRadius: 16,
        overflow: "hidden",
        zIndex: 1,
    },
});
