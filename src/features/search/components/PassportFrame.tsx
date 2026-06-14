import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { PassportFeedItem } from "../types/passport.types";

type PassportFrameProps = {
  item: PassportFeedItem;
};

const STAMP_MAP: Record<string, any> = {
  'CAFE': require('@/assets/stamps/cafe.png'),
  'RESTAURANT': require('@/assets/stamps/restaurant.png'),
  'BAR': require('@/assets/stamps/bar.png'),
  'NATURE': require('@/assets/stamps/park.png'),
  'CULTURE': require('@/assets/stamps/culture.png'),
  'ACTIVITY': require('@/assets/stamps/fitness.png'),
  'SHOPPING': require('@/assets/stamps/shopping.png'),
  'ETC': require('@/assets/stamps/etc.png'),
}

export default function PassportFrame({item}: PassportFrameProps) {

  const placeImageUrl = item.imageUrls?.[0];

  const [musicArtwork, setMusicArtwork] = useState<string | null>(null);

  // 음악 사진 불러오기
  useEffect(() => {
    if(!item.musicTitle || !item.musicArtist) {
      setMusicArtwork(null);
      return;
    }

    const fetchMusicArtwork = async () => {
      try {
        const keyword = `${item.musicTitle} ${item.musicArtist}`;
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(keyword)}&media=music&limit=1`;

        const response = await fetch(url);
        const data = await response.json();

        const artwork = data.results?.[0]?.artworkUrl100;

        if(artwork) {
          setMusicArtwork(artwork);
        } else {
          setMusicArtwork(null);
        }
      } catch(error) {
        console.log("음악 이미지 조회 실패:", error);
        setMusicArtwork(null);
      }
    };

    fetchMusicArtwork();
  }, [item.musicTitle, item.musicArtist])

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
          <View style={styles.photoArea}>
            <Image 
              source={require("@/assets/images/pinktape.png")}
              style={styles.tape}
              resizeMode="contain"
            />

            <Image 
              source={
                placeImageUrl
                  ? { uri: placeImageUrl}
                  : require("@/assets/images/default_profile.png")
              }  
              style={styles.placeImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.rightArea}>
            <Image 
              source={STAMP_MAP[item.category] ?? STAMP_MAP.ETC}
              style={styles.stampImage}
              resizeMode="contain"
            />

            <View style={styles.infoArea}>
              <Text style={styles.infoRow} numberOfLines={1} ellipsizeMode="tail">🏷 {item.categoryDisplayName || item.category}</Text>
              <Text style={styles.infoRow} numberOfLines={1} ellipsizeMode="tail">📍 {item.spaceName}</Text>
              <Text style={styles.infoRow} numberOfLines={1} ellipsizeMode="tail">🗓 {item.visitedAt}</Text>
            </View>
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
              {item.content}
            </Text>
          </View>

          <View style={styles.musicBox}>
            <Image 
              source={
                musicArtwork
                  ? {uri:musicArtwork}
                  : require("@/assets/images/default_profile.png")
              }
              style={styles.musicImage}
            />

            <View style={styles.musicText}>
              <Text style={styles.musicTitle}>
                {item.musicTitle || "음악 정보 없음"}
              </Text>
              <Text style={styles.musicArtist}>
                {item.musicArtist || ""}
              </Text>
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
    position: "relative",
    zIndex: 1,
  },
  topHalf: {
    minHeight: 245,
    flexDirection:"row",
    position: "relative",
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 18,
  },
  photoArea: {
    width: 165,
    height: 190,
    position: "relative",
  },
  rightArea: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    paddingTop: 8,
  },
  tape: {
    position: "absolute",
    top: 0,
    left: 100,
    width: 70,
    height: 50,
    zIndex: 10,
    transform: [{rotate: "5deg"}],
  },
  placeImage: {
    position: "absolute",
    left: 0,
    top: 18,
    width: 150,
    height: 150,
    transform: [{rotate: "-7deg"}], 
    borderWidth: 8,
    borderColor: "#FFFFFF",
  },
  stampImage: {
    width: 140,
    height: 140,
    marginRight: -6,
    marginBottom: -4,
    transform: [{rotate: "-10deg"}]
  },
  infoArea: {
    gap: 8,
    alignItems: "flex-start",
    maxWidth: 140,
  },
  infoRow: {
    width: "100%",
    fontSize: 12,
    color: "#222222",
    fontWeight: "600",
    fontFamily: 'Griun_Gellyroll',
    textAlign: "left",
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