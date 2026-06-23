import {
    getMyProfileEditForm,
    updateMyProfile,
    uploadProfileImage,
    withdrawMember
} from "@/src/api/profileApi";
import { REGIONS, matchDistrictFromAddress } from "@/src/constant/regions";
import { CenterPin } from "@/src/features/map/components/CenterPin";
import { naverReverseGeocode } from "@/src/features/map/utils/mapUtils";
import { Ionicons } from "@expo/vector-icons";
import { NaverMapView } from "@mj-studio/react-native-naver-map";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import * as Securestore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { UpdateProfileRequest } from "../types/profile.types";

const DEFAULT_LOCATION_CAMERA = {
    latitude: 37.5665,
    longitude: 126.978,
    zoom: 12,
};
const LOCATION_MAX_LENGTH = 20;
const SUPPORTED_DISTRICTS = Object.values(REGIONS).flat();

type ActivityLocationParts = {
    city: string;
    district: string;
};

const normalizeLocationInput = (value: string) =>
    value.trim().replace(/\s+/g, " ");

const hasOnlyLocationCharacters = (value: string) =>
    /^[가-힣a-zA-Z0-9\s]+$/.test(value);

const getCityDisplayName = (city: string) =>
    city
        .replace("특별자치시", "시")
        .replace("특별시", "시")
        .replace("광역시", "시");

const getDistrictDisplayName = (city: string, district: string) => {
    const cityWithoutSuffix = city.replace(/시$/, "");

    if (district.startsWith(`${cityWithoutSuffix} `)) {
        return district.slice(cityWithoutSuffix.length + 1);
    }

    return district;
};

const formatActivityLocation = ({ city, district }: ActivityLocationParts) => {
    const cityDisplayName = getCityDisplayName(city);
    const districtDisplayName = getDistrictDisplayName(cityDisplayName, district);

    return `${cityDisplayName} ${districtDisplayName}`;
};

const findActivityLocationParts = (
    value: string,
): ActivityLocationParts | undefined => {
    const matchedDistrict = matchDistrictFromAddress(value);

    for (const [city, districts] of Object.entries(REGIONS)) {
        const district =
            districts.find((item) => item === value) ??
            districts.find((item) => item === matchedDistrict);

        if (district) {
            return { city, district };
        }
    }

    return undefined;
};

const resolveActivityLocation = (value: string) => {
    const normalized = normalizeLocationInput(value);

    if (!normalized) {
        return { error: "활동 지역을 입력해 주세요." };
    }

    if (normalized.length > LOCATION_MAX_LENGTH) {
        return { error: `활동 지역은 ${LOCATION_MAX_LENGTH}자 이내로 입력해 주세요.` };
    }

    if (!hasOnlyLocationCharacters(normalized)) {
        return { error: "활동 지역에는 한글, 영문, 숫자, 공백만 사용할 수 있어요." };
    }

    const exactDistrict = SUPPORTED_DISTRICTS.find(
        (district) => district === normalized,
    );
    const locationParts = findActivityLocationParts(
        exactDistrict ?? normalized,
    );

    if (!locationParts) {
        return { error: "지원하는 시/군/구 단위의 활동 지역을 입력해 주세요." };
    }

    return { value: formatActivityLocation(locationParts) };
};

export default function ProfileEditView() {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    const[profileImg, setProfileImg] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [userId, setUserId] = useState("");
    const [nickname, setNickname] = useState("");
    const [location, setLocation] = useState("");
    const[bio, setBio] = useState("");
    const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
    const [locationPickerCenter, setLocationPickerCenter] = useState({
        latitude: DEFAULT_LOCATION_CAMERA.latitude,
        longitude: DEFAULT_LOCATION_CAMERA.longitude,
    });
    const [isResolvingLocation, setIsResolvingLocation] = useState(false);

    useEffect(() => {
        const subscription = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                Alert.alert("저장이 필요해요", "프로필을 저장해야 마이페이지로 돌아갈 수 있어요.");
                return true;
            },
        );

        return () => subscription.remove();
    }, [router]);


    // 1. 내 프로필 조회 API 연결
    useEffect(() => {
        const fetchMyProfile = async () => {

            try {
                const profile = await getMyProfileEditForm();

                setProfileImg(profile.profileImg);
                setEmail(profile.email);
                setUserId(profile.userId);
                setNickname(profile.nickname);
                setLocation(profile.location || "");
                setBio(profile.bio || "");
            } catch(error) {
                console.log("프로필 수정 화면 조회 에러:", error)
            } finally {
                setIsLoading(false);
            }
        }

        fetchMyProfile();
    }, []);

    // 2. 갤러리에서 사진 고르기
    const handlePickImage = async () => {

        const previousProfileImg = profileImg;

        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if(!permissionResult.granted) {
                console.log("갤러리 접근 권한이 필요합니다.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1,1],
                quality: 0.8
            })
            
            if(result.canceled) {
                return;
            }

            const selectedAsset = result.assets[0];

            const imageUri = selectedAsset.uri;
            const contentType = selectedAsset.mimeType || "image/jpeg";

            console.log("선택한 이미지 URI:", imageUri);
            console.log("선택한 이미지 contentType:", contentType);

            setIsUploadingImage(true);

            // 화면에서(사용자) 로컬 이미지로 미리보기
            setProfileImg(imageUri);

            // S3 업로드 후 imageUrl 받기
            const uploadedImageUrl = await uploadProfileImage(imageUri, contentType);

            console.log("업로드 완료 imageUrl:", uploadedImageUrl);

            // 최종적으로 서버에 저장할 URL로 교체
            setProfileImg(uploadedImageUrl);
        }catch(error) {
            console.log("프로필 이미지 업로드 에러:", error)

            // 업로드 실패 시 로컬 주소가 남지 않도록 이전 이미지로 복구
            setProfileImg(previousProfileImg);
        }finally {
            setIsUploadingImage(false);
        }
    }

    // 3. 프로필 수정 API 연결
    const handleOpenLocationPicker = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                return;
            }

            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            setLocationPickerCenter({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            });
        } catch (error) {
            console.log("활동 지역 현재 위치 조회 실패:", error);
        } finally {
            setIsLocationPickerOpen(true);
        }
    };

    const handleLocationCameraChanged = (event: any) => {
        const latitude = event?.latitude ?? event?.region?.latitude;
        const longitude = event?.longitude ?? event?.region?.longitude;

        if (typeof latitude === "number" && typeof longitude === "number") {
            setLocationPickerCenter({ latitude, longitude });
        }
    };

    const handleConfirmLocationPicker = async () => {
        setIsResolvingLocation(true);

        try {
            const address = await naverReverseGeocode(
                locationPickerCenter.latitude,
                locationPickerCenter.longitude,
            );
            const locationParts = address
                ? findActivityLocationParts(address)
                : undefined;

            if (!locationParts) {
                Alert.alert(
                    "활동 지역 선택 실패",
                    "선택한 위치에서 지원하는 구/군/시 정보를 찾지 못했어요.",
                );
                return;
            }

            setLocation(formatActivityLocation(locationParts));
            setIsLocationPickerOpen(false);
        } catch (error) {
            console.log("활동 지역 역지오코딩 실패:", error);
            Alert.alert(
                "활동 지역 선택 실패",
                "선택한 위치의 주소를 불러오지 못했어요.",
            );
        } finally {
            setIsResolvingLocation(false);
        }
    };

    const  handleSaveProfile  = async () => {
        if(nickname.trim().length === 0) {
            console.log("닉네임을 입력해 주세요.");
            Alert.alert("닉네임 확인", "닉네임을 입력해 주세요.");
            return;
        }

        const resolvedLocation = resolveActivityLocation(location);

        if (resolvedLocation.error || !resolvedLocation.value) {
            Alert.alert("활동 지역 확인", resolvedLocation.error);
            return;
        }

        setIsSaving(true);

        try {
            const requestBody: UpdateProfileRequest = {
                nickname: nickname.trim(),
                profileImg: profileImg,
                location: resolvedLocation.value,
                bio: bio.trim(),
            }

            console.log("프로필 수정 요청 body:", requestBody);

            const updatedProfile = await updateMyProfile(requestBody);

            setProfileImg(updatedProfile.profileImg)
            setEmail(updatedProfile.email)
            setUserId(updatedProfile.userId)
            setNickname(updatedProfile.nickname)
            setLocation(updatedProfile.location || "")
            setBio(updatedProfile.bio || "")

            router.replace("/profile" as any);
        } catch(error) {
            console.log("프로필 수정 에러:",error)
        }finally {
            setIsSaving(false)
        }
    };

    const handleWithdraw = () => {
        Alert.alert(
            "회원탈퇴",
            "회원탈퇴 시 계정 정보와 관련 데이터가 삭제되며 복구할 수 없습니다. 정말 탈퇴하시겠습니까?",
            [
                {
                    text: "취소",
                    style: "cancel",
                },
                {
                    text: "확인",
                    style: "destructive",
                    onPress: async () => {
                        setIsWithdrawing(true);

                        try {
                            await withdrawMember();

                            await Securestore.deleteItemAsync("accessToken");
                            await Securestore.deleteItemAsync("refreshToken");

                            Alert.alert(
                                "탈퇴 완료",
                                "회원탈퇴가 완료되었습니다.",
                                [
                                    {
                                        text: "확인",
                                        onPress: () => {
                                            router.replace("/(auth)" as any);
                                        },
                                    },
                                ]
                            );
                        } catch(error) {
                            console.log("회원탈퇴 에러:", error);

                            Alert.alert(
                                "회원탈퇴 실패",
                                error instanceof Error
                                    ? error.message
                                    : "회원탈퇴 중 문제가 발생했습니다."
                            )
                        } finally {
                            setIsWithdrawing(false);
                        }
                    }
                }
            ]
        )
    }

    if(isLoading) {
        return(
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1A3A6B" />
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleSaveProfile}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={24} color="#000000" />
                    </TouchableOpacity>

                    <View style={styles.headerRightSpace} />
                </View>

                {/*프로필 이미지 수정*/}
                <View style={styles.profileImageSection}>
                    <Image
                        source ={ 
                            profileImg
                                ? {uri: profileImg}
                                : require ("@/assets/images/default_profile.png")
                        }
                        style={styles.profileImage}
                    />
                    
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.cameraButton}
                        onPress={handlePickImage}
                    >
                        <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.infoCard}>
                    {/*연동 계정*/}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>연동 계정</Text>

                        <View style={styles.kakaoBox}>
                            <View style={styles.kakaoCircle}>
                                <Text style={styles.kakaoText}>kakao</Text>
                            </View>
                            <Text style={styles.infoValue}>카카오톡</Text>
                        </View>
                    </View>

                    {/*이메일*/}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>이메일</Text>
                        <Text style={styles.infoValue}>{email}</Text>
                    </View>

                    {/*사용자 번호*/}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>사용자번호</Text>
                        <Text style={styles.userCode}>{userId}</Text>
                    </View>
                </View>

                {/*닉네임 변경*/}
                <View style={styles.editCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardLabel}>닉네임</Text>
                        <Text style={styles.countText}>{nickname.length}/10</Text>
                    </View>

                    <View style={styles.nicknameInputBox}>
                        <TextInput
                            style={styles.nicknameInput}
                            value={nickname}
                            onChangeText={(text) => {
                                if (text.length <= 10) {
                                    setNickname(text)
                                }
                            }}
                            placeholder="닉네임을 입력해주세요"
                            placeholderTextColor="#A0A0A0"
                        />
                    </View>
                </View>

                {/*지역 변경*/}
                <View style={styles.editCard}>
                    <Text style={styles.cardLabel}>활동 지역</Text>

                    <View style={styles.locationInputRow}>
                        <TextInput
                            style={styles.locationInput}
                            value={location}
                            onChangeText={(text) => {
                                if (text.length <= LOCATION_MAX_LENGTH) {
                                    setLocation(text);
                                }
                            }}
                            placeholder="예: 서울시 용산구"
                            placeholderTextColor="#A0A0A0"
                            maxLength={LOCATION_MAX_LENGTH}
                        />

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleOpenLocationPicker}
                        >
                            <Ionicons name="map-outline" size={24} color="#A0A0A0" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.locationHelpText}>
                        시/군/구 단위로 입력해 주세요. 예: 서울시 용산구, 용산구
                    </Text>
                </View>

                {/*한 줄 소개*/}
                <View style={styles.editCard}>
                    <Text style={styles.cardLabel}>한 줄 소개</Text>

                    <TextInput
                        style={styles.bioInput}
                        value={bio}
                        onChangeText={setBio}
                        placeholder="자신을 소개하는 문구를 입력하세요."
                        placeholderTextColor="#777777"
                        multiline
                        textAlignVertical="top"
                    />
                </View>

                {/*변경사항 저장 버튼*/}
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                        styles.saveButton,
                        (isSaving || isUploadingImage) && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSaveProfile}
                    disabled = {isSaving || isUploadingImage} 
                >
                    {isSaving || isUploadingImage ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>변경사항 저장하기</Text>
                    )}
                </TouchableOpacity>

                {/*회원탈퇴 버튼*/}
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                        styles.withdrawButton,
                        isWithdrawing && styles.withdrawButtonDisabled,
                    ]}
                    onPress={handleWithdraw}
                    disabled={isWithdrawing}
                >
                    {isWithdrawing ? (
                        <ActivityIndicator size="small" color="#D64545" />
                    ) : (
                        <Text style={styles.withdrawButtonText}>회원탈퇴</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            <Modal
                visible={isLocationPickerOpen}
                animationType="slide"
                onRequestClose={() => setIsLocationPickerOpen(false)}
            >
                <View style={styles.locationPickerContainer}>
                    <NaverMapView
                        style={styles.locationPickerMap}
                        initialCamera={{
                            latitude: locationPickerCenter.latitude,
                            longitude: locationPickerCenter.longitude,
                            zoom: DEFAULT_LOCATION_CAMERA.zoom,
                        }}
                        isShowZoomControls={false}
                        onCameraChanged={handleLocationCameraChanged}
                    />
                    <CenterPin />

                    <View style={styles.locationPickerHeader}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.locationPickerIconButton}
                            onPress={() => setIsLocationPickerOpen(false)}
                        >
                            <Ionicons name="close" size={24} color="#111827" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.locationPickerFooter}>
                        <Text style={styles.locationPickerTitle}>
                            활동할 지역에 핀을 맞춰 주세요
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={[
                                styles.locationPickerConfirmButton,
                                isResolvingLocation &&
                                    styles.locationPickerConfirmButtonDisabled,
                            ]}
                            onPress={handleConfirmLocationPicker}
                            disabled={isResolvingLocation}
                        >
                            {isResolvingLocation ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.locationPickerConfirmText}>
                                    이 위치로 선택
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles= StyleSheet.create({
    container: {
        flex : 1,
        backgroundColor: "#F8FAFD"
    },
    content: {
        paddingHorizontal: 22,
        paddingTop: 35,
        paddingBottom: 130,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#F8FAFD",
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        height: 40,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    backButton: {
        width: 34,
        height: 34,
        justifyContent: "center",
        alignItems: "center",
    },
    headerRightSpace: {
        width: 34,
        height: 34,
    },
    profileImageSection: {
        alignSelf: "center",
        marginTop: 4,
        marginBottom: 32,
    },
    profileImage: {
        width: 128,
        height: 128,
        borderRadius: 64,
        borderWidth: 3.5,
        borderColor: "#000000",
        backgroundColor: "#d9d9d9",
    },
    cameraButton: {
        position: "absolute",
        right: 0,
        bottom: 4,
        width: 40,
        height: 40,
        borderRadius: 24,
        backgroundColor: "#1A3A6B",
        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.18,
        shadowRadius: 5,
        elevation: 5,
    },
    infoCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingVertical: 16,
        marginBottom: 18,

        shadowColor: "#4c4c4c",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.14,
        shadowRadius: 10,
        elevation: 5,
    },
    infoRow: {
        minHeight: 30,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    infoLabel: {
        color: "#99A1AF",
        fontSize: 14,
    },
    infoValue: {
        color: "#6A7282",
        fontSize: 14,
        fontWeight: "500",
    },
    kakaoBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    kakaoCircle: {
        width: 20,
        height: 20,
        borderRadius: 5,
        backgroundColor: "#FFE812",
        justifyContent: "center",
        alignItems: "center",
    },
    kakaoText: {
        color: "#000000",
        fontSize: 6.5,
        fontWeight: "500",
    },
    userCode: {
        color: "#1A3A6B",
        fontSize: 14,   
    },
    editCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 16,
        marginBottom: 16,

        shadowColor: "#4c4c4c",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.14,
        shadowRadius: 10,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    cardLabel: {
        color: "#99A1AF",
        fontSize: 14,
        fontWeight: "500",
    },
    countText: {
        color: "#6A7282",
        fontSize: 12,
        fontWeight: "500",
    },
    nicknameInputBox: {
        minHeight: 28,
        justifyContent: "center",
    },
    nicknameInput: {
        color: "#000000",
        fontSize: 18,
        fontWeight: "500",
        paddingVertical: 0,
        paddingHorizontal: 0,
        margin: 0,
        includeFontPadding: false,
    },
    locationInputRow: {
        minHeight: 28,
        flexDirection: "row",
        alignItems: "center",  
    },
    locationInput: {
        flex: 1,
        fontSize: 14,
        color: "#000000",
        fontWeight: "600",
        paddingVertical: 0,
        marginLeft: -3,
        marginTop: 3,
    },
    locationHelpText: {
        color: "#8A8A8A",
        fontSize: 11,
        marginTop: 8,
        lineHeight: 15,
    },
    locationPickerContainer: {
        flex: 1,
        backgroundColor: "#000000",
    },
    locationPickerMap: {
        flex: 1,
    },
    locationPickerHeader: {
        position: "absolute",
        top: 48,
        left: 18,
        right: 18,
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    locationPickerIconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.18,
        shadowRadius: 6,
        elevation: 5,
    },
    locationPickerFooter: {
        position: "absolute",
        left: 18,
        right: 18,
        bottom: 34,
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 16,
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 6,
    },
    locationPickerTitle: {
        color: "#111827",
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 12,
        textAlign: "center",
    },
    locationPickerConfirmButton: {
        height: 50,
        borderRadius: 14,
        backgroundColor: "#1A3A6B",
        justifyContent: "center",
        alignItems: "center",
    },
    locationPickerConfirmButtonDisabled: {
        backgroundColor: "#A7B3C4",
    },
    locationPickerConfirmText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },
    bioInput: {
        height: 80,
        borderWidth: 1,
        borderColor: "#585858",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: "#000000",
        fontSize: 12,
        lineHeight: 18,
        marginTop: 10,
    },
    saveButton: {
        height: 56,
        borderRadius: 18,
        backgroundColor: "#1A3A6B",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 6,
        
        shadowColor: "#1A3A6B",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    saveButtonDisabled: {
        backgroundColor: "#A7B3C4"
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    withdrawButton: {
        height: 52,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
        borderWidth: 1.2,
        borderColor: "#D64545",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 25,
    },
    withdrawButtonDisabled: {
        borderColor: "#E3A5A5",
        backgroundColor: "#FFF7F7",
    },
    withdrawButtonText: {
        color: "#D64545",
        fontSize: 16,
        fontWeight: "600"
    }
})
