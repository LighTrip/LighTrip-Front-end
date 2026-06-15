import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Shadow } from "react-native-shadow-2";

import NoiseOverlay from "@/src/components/common/NoiseOverlay";
import { REGIONS } from "@/src/constant/regions";
import PassportDetail from "../../passport/screens/PassportDetail";
import EditPlaceScreen from "./EditPlaceScreen";

const { width } = Dimensions.get("window");
export const CARD_WIDTH = width * 0.91;

const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;

// onClose: MapScreen에서 열었을 때 닫기 콜백
type Props = {
  onClose?: () => void;
  initialLatitude?: number;
  initialLongitude?: number;
  initialAddress?: string;
};

const AddPlaceScreen = ({ onClose }: Props) => {
  const router = useRouter();

  const [showEdit, setShowEdit] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  const [visitDate, setVisitDate] = useState<Date | null>(null);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
  const [locationRegion, setLocationRegion] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [completedPlace, setCompletedPlace] = useState<any | null>(null);

  const fetchPlaceNameFromCoords = async (
    latitude: number,
    longitude: number,
  ) => {
    try {
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`,
        { headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` } },
      );
      const data = await response.json();
      if (data.documents && data.documents.length > 0) {
        const doc = data.documents[0];
        const roadAddress = doc.road_address?.address_name;
        const jibunAddress = doc.address?.address_name;
        setLocationName(roadAddress ?? jibunAddress ?? null);
      }
    } catch (err) {
      console.error("카카오 장소 검색 실패:", err);
    }
  };

  const extractFromExif = async (exif: any) => {
    try {
      if (exif?.DateTimeOriginal) {
        const raw = exif.DateTimeOriginal as string;
        const [datePart, timePart] = raw.split(" ");
        const [year, month, day] = datePart.split(":");
        const parsed = new Date(`${year}-${month}-${day}T${timePart}`);
        if (!isNaN(parsed.getTime())) setVisitDate(parsed);
      }

      if (exif?.GPSLatitude && exif?.GPSLongitude) {
        const toDegrees = (val: number | number[]) => {
          if (Array.isArray(val)) return val[0] + val[1] / 60 + val[2] / 3600;
          return val;
        };
        let lat = toDegrees(exif.GPSLatitude);
        let lng = toDegrees(exif.GPSLongitude);
        if (exif.GPSLatitudeRef === "S") lat = -lat;
        if (exif.GPSLongitudeRef === "W") lng = -lng;

        setLatitude(lat);
        setLongitude(lng);

        const [place] = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        });
        if (place) {
          const fullAddress = [place.city, place.district, place.street]
            .filter(Boolean)
            .join(" ");
          setLocationAddress(fullAddress);
          if (place.district) {
            const allDistricts = Object.values(REGIONS).flat();
            const matched = allDistricts.find((r) =>
              place.district!.includes(r),
            );
            if (matched) setLocationRegion(matched);
          }
        }
        await fetchPlaceNameFromCoords(lat, lng);
      }
    } catch (err) {
      console.error("EXIF 추출 실패:", err);
    }
  };

  const openAlbum = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("앨범 접근 권한이 필요해요");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
      exif: true,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setPhoto(asset.uri);
      if (asset.exif) await extractFromExif(asset.exif);
    }
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert("카메라 권한이 필요해요");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
      exif: true,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setPhoto(asset.uri);
      if (asset.exif) await extractFromExif(asset.exif);
    }
  };

  if (completedPlace) {
    return (
      <PassportDetail
        item={completedPlace}
        onBack={() => setCompletedPlace(null)}
      />
    );
  }

  if (showEdit) {
    return (
      <EditPlaceScreen
        onBack={() => setShowEdit(false)}
        onComplete={(item) => {
          Alert.alert("등록 완료", "새 여권이 등록되었습니다! 🎉", [
            {
              text: "확인",
              onPress: () => {
                if (onClose) {
                  // MapScreen에서 열린 경우 → 지도로 복귀
                  onClose();
                } else {
                  // 탭에서 열린 경우 → 여권 탭으로 이동
                  router.replace("/(tabs)/passport");
                }
              },
            },
          ]);
        }}
        photo={photo}
        description={description}
        visitDate={visitDate}
        locationAddress={locationAddress}
        locationRegion={locationRegion}
        locationName={locationName}
        latitude={latitude}
        longitude={longitude}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Shadow
        distance={6}
        startColor={"#00000012"}
        offset={[0, 2]}
        style={{ width: CARD_WIDTH, marginBottom: 5, borderRadius: 16 }}
      >
        <View style={styles.photoContainer}>
          <NoiseOverlay />
          <View style={styles.photoTextbox}>
            <Text style={styles.photoText}>장소의 사진을 등록해 주세요!</Text>
          </View>
          <TouchableOpacity style={styles.albumButton} onPress={openAlbum}>
            {photo !== null ? (
              <Image
                source={{ uri: photo }}
                style={{ width: "100%", height: "100%", borderRadius: 16 }}
                resizeMode="cover"
              />
            ) : (
              <Text style={{ color: "#aaa" }}>앨범에서 선택하기</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
            <Text style={styles.clickText}>카메라로 촬영</Text>
          </TouchableOpacity>
        </View>
      </Shadow>

      <Shadow
        distance={6}
        startColor={"#00000012"}
        offset={[0, 2]}
        style={{ width: CARD_WIDTH, borderRadius: 16 }}
      >
        <View style={styles.infoContainer}>
          <NoiseOverlay />
          <View style={styles.infoTextbox}>
            <Text style={styles.infotitleText}>
              어떤 곳인지 간단히 설명해 주세요.
            </Text>
          </View>
          <View style={styles.infoTypeBox}>
            <TextInput
              style={styles.infoTypeText}
              placeholder="카페에 가서 커피를 마셨다!"
              placeholderTextColor="#666666"
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>
      </Shadow>

      <TouchableOpacity
        style={styles.clickContainer}
        onPress={() => setShowEdit(true)}
      >
        <Text style={styles.clickText}>기록 생성하기 with AI</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default AddPlaceScreen;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFD",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: StatusBar.currentHeight || 65,
  },
  photoContainer: {
    position: "relative",
    height: 450,
    borderRadius: 16,
    backgroundColor: "#F8FAFD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  photoTextbox: {
    width: "91%",
    height: 50,
    borderRadius: 16,
  },
  photoText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
    marginLeft: 5,
  },
  albumButton: {
    width: 340,
    height: 315,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    overflow: "hidden",
  },
  cameraButton: {
    width: 240,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A3A6B",
    borderRadius: 20,
  },
  infoContainer: {
    height: 170,
    borderRadius: 16,
    backgroundColor: "#F8FAFD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  infoTextbox: {
    width: "91%",
    height: 30,
    marginBottom: 10,
  },
  infotitleText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
  infoTypeBox: {
    width: 340,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
  },
  infoTypeText: {
    fontSize: 14,
    color: "#A0A0A0",
    textAlignVertical: "top",
    paddingHorizontal: 10,
  },
  clickContainer: {
    width: "91%",
    height: 45,
    borderRadius: 16,
    backgroundColor: "#1A3A6B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  clickText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
