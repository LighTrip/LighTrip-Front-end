import { Image, StyleSheet, Text, View } from "react-native";
import type { Place } from "../types/passport.types";

type SearchPassportCardProps = {
  item: Place;
};

export default function PassportFrame({item}: SearchPassportCardProps) {
  return (
    <View style={styles.passportCard}>
      <Image
        source={require("@/assets/images/noise.png")}
        style={styles.noiseBackground}
        resizeMode="cover"
      />

      <View style={styles.passportContent}>
        {/*여권 위쪽 부분*/}
        <View style={styles.topHalf}>
          <Image 
            source={require("@/assets/images/pinktape.png")}
            style={styles.tape}
            resizeMode="contain"
          />
          <Image 
            source={item.image}
            style={styles.placeImage}
            resizeMode="cover"
          />
          <Image 
            source={require("@/assets/images/StampSeal.png")}
            style={styles.stampImage}
            resizeMode="contain"
          />

          <View style={styles.infoArea}>
            <Text style={styles.infoRow}>📍 {item.name}</Text>
            <Text style={styles.infoRow}>🗓 {item.date}</Text>
          </View>
        </View>

        {/*구분선*/}
        <View style={styles.dividerRow}>
          <View style={styles.dividerCircleLeft} />
          <View style={styles.dividerLine} />
          <View style={styles.dividerCircleRight} />
        </View>

        {/*여권 아래쪽 부분*/}
        <View style={styles.bottomHalf}>
          <View style={styles.reviewBox}>
            <Text style={styles.reviewText}>
              "마포구에서 맛있는 커피를 파는 카페를 찾았다! 케이크도 있었는데 다음에 가면 케이크도 꼭 먹어 봐야겠다는 생각이 들었다. 🍰"
            </Text>
          </View>

          <View style={styles.musicBox}>
            <Image 
              source={require("@/assets/images/profile1.jpg")}
              style={styles.musicImage}
            />

            <View style={styles.musicText}>
              <Text style={styles.musicTitle}>멍냥</Text>
              <Text style={styles.musicArtist}>KiiiKiii</Text>
            </View>
          </View>

          <Text style={styles.scrollText}>
            {`<<<<<<<<<<<<<< scroll down >>>>>>>>>>>>>>`}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  passportCard: {
    flex: 1,
    width: "100%",
    position: "relative",
    backgroundColor: "#F8FAFD",
    borderRadius: 16,
    overflow: "hidden",
  },
  noiseBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 1,
  },
  passportContent: {
    flex: 1,
    position: "relative",
    zIndex: 1,
  },
  topHalf: {
    flex: 1.05,
    position: "relative",
    paddingTop: 28,
  },
  tape: {
    position: "absolute",
    top: 28,
    left: "40%",
    width: 70,
    height: 50,
    zIndex: 10,
    transform: [{rotate: "5deg"}],
  },
  placeImage: {
    position: "absolute",
    left: 28,
    top: 45,
    width: 150,
    height: 150,
    transform: [{rotate: "-7deg"}], 
    borderWidth: 8,
    borderColor: "#FFFFFF",
  },
  stampImage: {
    position: "absolute",
    right: 5,
    top: 55,
    width: 120,
    height: 120,
  },
  infoArea: {
    position: "absolute",
    right: 24,
    bottom: 28,
    gap: 8,
  },
  infoRow: {
    fontSize: 12,
    color: "#222222",
    fontWeight: "600",
    fontFamily: 'Griun_Gellyroll',
  },
  dividerRow: {
    height: 15,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    borderWidth: 0.5,
    borderColor: "#C8C8C8",
  },
  dividerCircleLeft: {
    position: "absolute",
    left: -11,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#F8FAFD",
    zIndex: 2,
  },
  dividerCircleRight: {
    position: "absolute",
    right: -11,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#F8FAFD",
    zIndex: 2,
  },
  bottomHalf: {
    flex: 0.95,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  reviewBox: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  reviewText: {
    fontSize: 13,
    lineHeight: 22,
    color: "#111111",
    textAlign: "center",
    fontWeight: "500",
    fontFamily: 'Griun_Gellyroll',
  },
  musicBox: {
    height: 68,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    gap: 14,
    marginBottom: 12,
  },
  musicImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 65,
  },
  musicText: {
    alignItems: "center",
  },
  musicTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111111",
  },
  musicArtist: {
    fontSize: 12,
    color: "#111111",
    marginTop: 4,
  },
  scrollText: {
    fontSize: 13,
    color: "#333333",
    textAlign: "center",
    fontFamily: 'SpaceMono',
  }
})