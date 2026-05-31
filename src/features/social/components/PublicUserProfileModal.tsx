import { Ionicons } from "@expo/vector-icons";
import {
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { PublicUserProfile } from "../types/social.types";

const defaultProfile = require("../../../../assets/images/default_profile.png");

type PublicUserProfileModalProps = {
    visible: boolean;
    user: PublicUserProfile | null;
    onClose: () => void;
};

export default function PublicUserProfileModal({
    visible,
    user,
    onClose,
} : PublicUserProfileModalProps) {
    return(
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={20} color="#FFFFFF" />
                    </TouchableOpacity>

                    <Image
                        source={
                            user?.profileImg
                                ? {uri: user.profileImg}
                                : defaultProfile
                        }
                        style={styles.profileImage}
                    />

                    <Text style={styles.nickname}>
                        {user?.nickname ?? "사용자"}
                    </Text>

                    <Text style={styles.userId}>
                        #{user?.userId}
                    </Text>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    modal: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 28,
        alignItems: "center",
    },
    closeButton : {
        position: "absolute",
        right: 16,
        top: 16,
        width: 32,
        height: 32,
        borderRightColor: "#1A3A6B",
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    profileImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginBottom: 14,
    },
    nickname: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    userId: {
        marginTop: 6,
        fontSize: 13,
        color: "#6B7280",
    }
})