import MarqueeText from "@/src/components/common/MarqueeText";
import { scaleFont, scaleH, scaleW } from "@/src/utils/scale";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { PassportFeedItem } from "../types/passport.types";

type PassportFrameProps = {
  item: PassportFeedItem;
};

const { width, height: screenHeight } = Dimensions.get("window");

const STAMP_MAP: Record<string, any> = {
  CAFE: require("@/assets/stamps/cafe.png"),
  RESTAURANT: require("@/assets/stamps/restaurant.png"),
  BAR: require("@/assets/stamps/bar.png"),
  NATURE: require("@/assets/stamps/park.png"),
  CULTURE: require("@/assets/stamps/culture.png"),
  ACTIVITY: require("@/assets/stamps/fitness.png"),
  SHOPPING: require("@/assets/stamps/shopping.png"),
  ETC: require("@/assets/stamps/etc.png"),
};

const TAPE_COLOR_MAP: Record<string, string> = {
  CAFE: "#A9714A",
  RESTAURANT: "#D65C6B",
  BAR: "#8E5FA6",
  NATURE: "#5FA05A",
  CULTURE: "#F0785A",
  ACTIVITY: "#4472A8",
  SHOPPING: "#E8558F",
  ETC: "#7C8798",
};

export default function PassportFrame({ item }: PassportFrameProps) {
  const placeImageUrl = item.imageUrls?.[0];

  const [musicArtwork, setMusicArtwork] = useState<string | null>(null);

  // 음악 사진 불러오기
  useEffect(() => {
    if (!item.musicTitle || !item.musicArtist) {
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

        if (artwork) {
          setMusicArtwork(artwork);
        } else {
          setMusicArtwork(null);
        }
      } catch (error) {
        console.log("음악 이미지 조회 실패:", error);
        setMusicArtwork(null);
      }
    };

    fetchMusicArtwork();
  }, [item.musicTitle, item.musicArtist]);

  return (
    <View style={styles.passportCardShadow}>
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
              <View style={styles.tape}>
                <Svg
                  width={scaleW(100)}
                  height={scaleH(70)}
                  viewBox="0 0 90 69"
                  fill="none"
                >
                  <Path
                    d="M15.0562 0L85.0885 42.785L71.4908 46.833L74.0323 60.3988L3.99995 17.6137L15.0562 0Z"
                    fill={TAPE_COLOR_MAP[item.category] ?? "#FFD9D9"}
                  />
                </Svg>
              </View>

              <View style={styles.placeImageShadow}>
                <Image
                  source={
                    placeImageUrl
                      ? { uri: placeImageUrl }
                      : require("@/assets/images/default_profile.png")
                  }
                  style={styles.placeImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            <View style={styles.rightArea}>
              <Image
                source={STAMP_MAP[item.category] ?? STAMP_MAP.ETC}
                style={styles.stampImage}
                resizeMode="contain"
              />

              <View style={styles.infoArea}>
                {[
                  {
                    emoji: "🏷",
                    text: item.categoryDisplayName || item.category,
                  },
                  { emoji: "📍", text: item.spaceName },
                  { emoji: "🗓", text: item.visitedAt },
                ].map(({ emoji, text }, i) => (
                  <View key={i} style={styles.infoRow}>
                    <Text style={styles.infoEmoji}>{emoji}</Text>
                    <Text
                      style={styles.infoText}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {text}
                    </Text>
                  </View>
                ))}
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
              <Text style={styles.reviewText}>{item.content}</Text>
            </View>

            <View style={styles.musicBox}>
              {musicArtwork ? (
                <Image
                  source={{ uri: musicArtwork }}
                  style={styles.musicImage}
                />
              ) : (
                <View style={[styles.musicImage, styles.musicImagePlaceholder]}>
                  <Ionicons name="musical-notes" size={20} color="#B6BDC7" />
                </View>
              )}

              <View style={styles.musicText}>
                {item.musicTitle ? (
                  <>
                    <MarqueeText style={styles.musicTitle}>
                      {item.musicTitle}
                    </MarqueeText>

                    {/* 아티스트가 없을 때 빈 줄이 남지 않도록 아예 그리지 않는다. */}
                    {!!item.musicArtist && (
                      <MarqueeText style={styles.musicArtist}>
                        {item.musicArtist}
                      </MarqueeText>
                    )}
                  </>
                ) : (
                  <Text style={styles.musicEmptyText}>음악 없음</Text>
                )}
              </View>
            </View>

            <Text style={styles.scrollText}>
              {`<<<<<<<<<<<<<<   scroll down   >>>>>>>>>>>>>>`}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // overflow: "hidden"인 뷰는 자기 자신의 그림자도 함께 잘라내므로,
  // 그림자는 overflow가 없는 이 바깥 뷰에 둔다.
  passportCardShadow: {
    height: "100%",
    borderRadius: 16,
    backgroundColor: "#F8FAFD",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  passportCard: {
    width: "100%",
    height: "100%",
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
    flexDirection: "row",
    position: "relative",
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 18,
  },
  photoArea: {
    width: scaleW(175),
    height: scaleW(200),
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
    top: scaleW(-15),
    left: scaleW(75),
    width: scaleW(120),
    height: scaleH(90),
    zIndex: 10,
    transform: [{ rotate: "5deg" }],
  },
  // Image의 resizeMode="cover"는 프레임에 맞게 자체 레이어를 클리핑하므로,
  // 그 위에 준 그림자는 함께 잘려서 안 보인다. 그림자는 클리핑 없는
  // 이 바깥 뷰에 두고, 흰 테두리는 padding으로 표현한다.
  placeImageShadow: {
    position: "absolute",
    left: 0,
    top: 0,
    width: scaleW(150),
    height: scaleW(190),
    padding: 8,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "-7deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  placeImage: {
    width: "100%",
    height: "100%",
  },
  stampImage: {
    width: scaleW(100),
    height: scaleW(100),
    bottom: scaleW(90),
    right: scaleW(30),
    position: "absolute",
  },
  infoArea: {
    gap: 8,
    alignItems: "flex-start",
    maxWidth: scaleW(140),
    left: scaleW(10),
    bottom: scaleW(10),
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  infoEmoji: {
    width: 18,
    fontSize: 12,
    textAlign: "center",
  },
  infoText: {
    flex: 1,
    fontSize: scaleFont(13),
    color: "#222222",
    fontWeight: "600",
    fontFamily: "Griun_Gellyroll",
    marginLeft: 4,
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
    width: "120%",
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
    paddingTop: 40,
    paddingBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewBox: {
    width: "100%",
    height: scaleW(80),
    borderRadius: scaleW(12),
    top: scaleW(10),
    alignItems: "center",
    justifyContent: "center",
  },
  reviewText: {
    fontSize: scaleFont(14),
    color: "#333",
    textAlign: "center",
    lineHeight: scaleW(20),
    width: "90%",
    fontFamily: "Griun_Gellyroll",
  },
  musicBox: {
    position: "absolute",
    width: width * 0.8,
    height: 68,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    gap: 14,
    top: scaleH(180),
  },
  musicImage: {
    width: scaleW(46),
    height: scaleH(46),
    borderRadius: scaleW(23),
    // marginRight: 65 는 글자를 가운데 정렬로 쓰던 시절의 여백이었다.
    // 이제 글자가 왼쪽부터 흐르므로 남겨 두면 시작점이 오른쪽으로 밀린다. (gap: 14 로 충분)
  },
  musicImagePlaceholder: {
    backgroundColor: "#EEF1F5",
    alignItems: "center",
    justifyContent: "center",
  },
  musicEmptyText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  musicText: {
    // 흘러갈 폭을 정해 줘야 마퀴가 동작한다. 없으면 글자만큼 늘어나 카드를 넘친다.
    flex: 1,
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
    position: "absolute",
    fontSize: scaleFont(13),
    color: "#333333",
    textAlign: "center",
    fontFamily: "Griun_Gellyroll",
    top: scaleH(263),
  },
});
