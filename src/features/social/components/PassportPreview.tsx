import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PLACES = [
    {
        id: "1",
        district: "마포",
        image: require("../../../../assets/images/mapo.png"),
    },
    {
        id: "2",
        district: "용산",
        image: require("../../../../assets/images/yongsan.png"),
    },
    {
        id: "3",
        district: "서대문",
        image: require("../../../../assets/images/seodaemun.png"),
    },
    {
        id: "4",
        district: "중구",
        image: require("../../../../assets/images/mapo.png"),
    },
    {
        id: "5",
        district: "강남",
        image: require("../../../../assets/images/yongsan.png"),
    },
    {
        id: "6",
        district: "서초",
        image: require("../../../../assets/images/seodaemun.png"),
    },
]

export default function PassportPreview() {
    return (
        <View style={styles.container}>
            {PLACES.map((item) => (
                <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    style={styles.passportCover}
                >
                    <Image 
                        source={item.image}
                        style={styles.coverImage}
                        resizeMode="cover"
                    />
                    
                    <View style={styles.overlay} />

                    <Text style={styles.districtName}>{item.district}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingBottom: 20,
    },
    passportCover: {
        width: "48%",
        height: 200,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,

        shadowColor: "#1A3A6B",
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 4,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.18)",
    },
    coverImage: {
        width: "120%",
        height: "120%",
    },
    districtName: {
        position: "absolute",
        top: 35,
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "600",
        fontStyle: "italic"
    }
});