import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useMemo, useRef, useState } from "react";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Friend } from "../types/social.types";
import MapPreview from "./MapPreview";
import PassportPreview from "./PassportPreview";

type FriendDetailModalProps = {
    visible: boolean;
    friend: Friend | null;
    onClose: () => void;
};

export default function FriendDetailModal({
    visible,
    friend,
    onClose,
}: FriendDetailModalProps) {
    const [selectedTab, setSelectedTab] = useState<"passport" | "map">("passport");

    const snapPoints = useMemo(() => ["70%", "95%"], []);
    const bottomSheetRef = useRef<BottomSheet>(null);

    if (!visible || !friend) return null;

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose
            onClose={onClose}
            backdropComponent={(props) => (
                <BottomSheetBackdrop
                    {...props}
                    appearsOnIndex={0}
                    disappearsOnIndex={-1}
                    pressBehavior="close"
                />
            )}
            handleIndicatorStyle={styles.handleIndicator}
            backgroundStyle={styles.sheetBackground}
        >

            <BottomSheetScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            >
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.closeButton}
                    onPress={() => bottomSheetRef.current?.close()}
                >
                    <Ionicons name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.profileArea}>
                    <Image source={friend.image} style={styles.profileImage} />

                    <View style={styles.profileTextArea}>
                        <Text style={styles.name}>
                            {friend.name} #{friend.id}
                        </Text>

                        <Text style={styles.infoText}>
                            여권: {friend.passportCount} | 도장: {friend.stampCount}
                        </Text>

                        <View style={styles.visitArea}>
                            <Ionicons
                                name="location-outline"
                                size={15}
                                color="#B8B8B8"
                            />
                            <Text style={styles.visitText}>
                                최근 방문: 서울특별시 중구
                            </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.tabArea}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[
                                    styles.tabButton,
                                    selectedTab === "passport" && styles.activeTabButton,
                                ]}
                                onPress={() => setSelectedTab("passport")}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        selectedTab === "passport" && styles.activeTabText,
                                    ]}
                                >
                                    여권
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[
                                    styles.tabButton,
                                    selectedTab === "map" && styles.activeTabButton,
                                ]}
                                onPress={() => setSelectedTab("map")}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        selectedTab === "map" && styles.activeTabText,
                                    ]}
                                >
                                    지도
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {selectedTab === "passport" ? (
                            <PassportPreview />
                        ) : (
                            <MapPreview />
                        )}
            </BottomSheetScrollView>
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    sheetBackground: {
        backgroundColor: "#F8FAFD",
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    handleIndicator: {
        width: 42,
        height: 5,
        borderRadius: 99,
        backgroundColor: "#D0D5DD",
    },
    closeButton: {
        position: "absolute",
        top: 15,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 25,
        backgroundColor: "#1A3A6B",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
    },
    contentContainer: {
        paddingHorizontal: 24,
        paddingTop: 64,
        paddingBottom: 80,
    },
    profileArea: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 18,
    },
    profileImage: {
        width: 90,
        height: 90,
        borderRadius: 60,
        marginRight: 20,
    },
    profileTextArea: {
        flex: 1,
    },
    name: {
        fontSize: 24,
        fontWeight: "700",
        color: "#000000",
    },
    infoText: {
        fontSize: 15,
        color: "#000000",
        fontWeight: "500",
        marginBottom: 3,
    },
    visitArea: {
        flexDirection: "row",
        alignItems: "center",
    },
    visitText: {
        fontSize: 13,
        color: "#B8B8B8",
        fontWeight: "500",
        marginLeft: 3,
    },
    tabArea: {
        flexDirection: "row",
        marginBottom: 14,
    },
    tabButton: {
        minWidth: 76,
        height: 38,
        borderRadius: 19,
        borderWidth: 1,
        borderColor: "#1A3A6B",
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    activeTabButton: {
        backgroundColor: "#1A3A6B",
    },
    tabText: {
        fontSize: 13,
        color: "#1A3A6B",
        fontWeight: "700",
    },
    activeTabText: {
        color: "#FFFFFF",
    },
});