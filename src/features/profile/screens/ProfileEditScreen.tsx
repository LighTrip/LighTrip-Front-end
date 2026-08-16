import { clearTokens } from "@/src/api/authToken";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { compressImageForUpload } from "@/src/utils/imageUpload";
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
    // 지금 입력 중인 칸을 강조하기 위한 상태
    const [focusedField, setFocusedField] = useState<string | null>(null);
    // 탭바 없이 전체 화면으로 뜨는 화면이라 상태바 높이를 직접 확보해야 한다.
    const insets = useSafeAreaInsets();

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

            // 원본 그대로 올리면 파일이 커서 나중에 불러올 때 느리다.
            const imageUri = await compressImageForUpload(selectedAsset.uri);
            const contentType = "image/jpeg";

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

                            await clearTokens();

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
                contentContainerStyle={[
                    styles.content,
                    {
                        paddingTop: insets.top + 8,
                        paddingBottom: insets.bottom + 32,
                    },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={24} color="#111827" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>프로필 수정</Text>

                    <View style={styles.headerRightSpace} />
                </View>

                {/*프로필 이미지 수정*/}
                <View style={styles.profileImageSection}>
                    <View style={styles.profileImageRing}>
                        <Image
                            source ={
                                profileImg
                                    ? {uri: profileImg}
                                    : require ("@/assets/images/default_profile.png")
                            }
                            style={styles.profileImage}
                        />
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.cameraButton}
                        onPress={handlePickImage}
                    >
                        <Ionicons name="camera" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>계정 정보</Text>

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

                    <View style={styles.infoDivider} />

                    {/*이메일*/}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>이메일</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                            {email}
                        </Text>
                    </View>

                    <View style={styles.infoDivider} />

                    {/*사용자 번호*/}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>사용자번호</Text>
                        <View style={styles.userCodeBadge}>
                            <Text style={styles.userCode}>{userId}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>내 정보</Text>

                {/* 입력 항목은 한 장의 카드로 묶는다.
                    항목마다 카드를 띄우면 그림자 상자가 여러 겹 쌓여 산만해진다. */}
                <View style={styles.editCard}>
                    {/*닉네임 변경*/}
                    <View style={styles.fieldGroup}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardLabel}>닉네임</Text>
                            <Text style={styles.countText}>
                                {nickname.length}/10
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.field,
                                focusedField === "nickname" && styles.fieldFocused,
                            ]}
                        >
                            <TextInput
                                style={styles.fieldInput}
                                value={nickname}
                                onChangeText={(text) => {
                                    if (text.length <= 10) {
                                        setNickname(text)
                                    }
                                }}
                                onFocus={() => setFocusedField("nickname")}
                                onBlur={() => setFocusedField(null)}
                                placeholder="닉네임을 입력해주세요"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    <View style={styles.infoDivider} />

                    {/*지역 변경*/}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.cardLabel}>활동 지역</Text>

                        <View style={styles.locationInputRow}>
                            <View
                                style={[
                                    styles.field,
                                    styles.locationField,
                                    focusedField === "location" &&
                                        styles.fieldFocused,
                                ]}
                            >
                                <TextInput
                                    style={styles.fieldInput}
                                    value={location}
                                    onChangeText={(text) => {
                                        if (text.length <= LOCATION_MAX_LENGTH) {
                                            setLocation(text);
                                        }
                                    }}
                                    onFocus={() => setFocusedField("location")}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="예: 서울시 용산구"
                                    placeholderTextColor="#9CA3AF"
                                    maxLength={LOCATION_MAX_LENGTH}
                                />
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.mapButton}
                                onPress={handleOpenLocationPicker}
                            >
                                <Ionicons
                                    name="map-outline"
                                    size={20}
                                    color="#1A3A6B"
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.locationHelpText}>
                            시/군/구 단위로 입력해 주세요. 예: 서울시 용산구
                        </Text>
                    </View>

                    <View style={styles.infoDivider} />

                    {/*한 줄 소개*/}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.cardLabel}>한 줄 소개</Text>

                        <View
                            style={[
                                styles.field,
                                styles.bioField,
                                focusedField === "bio" && styles.fieldFocused,
                            ]}
                        >
                            <TextInput
                                style={[styles.fieldInput, styles.bioInput]}
                                value={bio}
                                onChangeText={setBio}
                                onFocus={() => setFocusedField("bio")}
                                onBlur={() => setFocusedField(null)}
                                placeholder="자신을 소개하는 문구를 입력하세요."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                    </View>
                </View>

                {/*변경사항 저장 버튼*/}
                <TouchableOpacity
                    activeOpacity={0.85}
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
                    activeOpacity={0.7}
                    style={styles.withdrawButton}
                    onPress={handleWithdraw}
                    disabled={isWithdrawing}
                >
                    {isWithdrawing ? (
                        <ActivityIndicator size="small" color="#9CA3AF" />
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
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 48,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#F8FAFD",
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        height: 44,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    backButton: {
        width: 34,
        height: 34,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: -6,
    },
    headerTitle: {
        color: "#111827",
        fontSize: 18,
        fontWeight: "700",
    },
    headerRightSpace: {
        width: 34,
        height: 34,
    },
    profileImageSection: {
        alignSelf: "center",
        marginTop: 8,
        marginBottom: 28,
    },
    // 검은 테두리 대신 흰 링 + 그림자로 배경에서 떠 보이게 한다.
    profileImageRing: {
        padding: 4,
        borderRadius: 64,
        backgroundColor: "#FFFFFF",

        shadowColor: "#1A3A6B",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.12,
        shadowRadius: 14,
        elevation: 4,
    },
    profileImage: {
        width: 112,
        height: 112,
        borderRadius: 56,
        backgroundColor: "#E5E7EB",
    },
    cameraButton: {
        position: "absolute",
        right: 2,
        bottom: 2,
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "#1A3A6B",
        borderWidth: 3,
        borderColor: "#F8FAFD",
        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    sectionTitle: {
        color: "#6B7280",
        fontSize: 13,
        fontWeight: "700",
        marginBottom: 10,
        marginLeft: 4,
    },
    infoCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingVertical: 4,
        marginBottom: 24,

        shadowColor: "#4c4c4c",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    infoRow: {
        minHeight: 48,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
    },
    infoDivider: {
        height: 1,
        backgroundColor: "#EEF1F5",
    },
    infoLabel: {
        color: "#9CA3AF",
        fontSize: 13,
        fontWeight: "500",
    },
    infoValue: {
        flexShrink: 1,
        color: "#374151",
        fontSize: 14,
        fontWeight: "600",
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
    userCodeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: "#EEF3FA",
    },
    userCode: {
        color: "#1A3A6B",
        fontSize: 13,
        fontWeight: "700",
    },
    editCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        paddingHorizontal: 18,
        marginBottom: 8,

        shadowColor: "#4c4c4c",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    fieldGroup: {
        paddingVertical: 16,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardLabel: {
        color: "#6B7280",
        fontSize: 13,
        fontWeight: "600",
    },
    countText: {
        color: "#9CA3AF",
        fontSize: 12,
        fontWeight: "600",
    },
    // 세 입력칸이 모두 같은 모양을 쓰도록 공통 필드로 뺐다.
    // (기존에는 한 줄 소개만 테두리가 있어서 나머지가 입력칸으로 보이지 않았다.)
    field: {
        minHeight: 48,
        justifyContent: "center",
        marginTop: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5EAF2",
        backgroundColor: "#F7F9FC",
    },
    fieldFocused: {
        borderColor: "#1A3A6B",
        backgroundColor: "#FFFFFF",
    },
    fieldInput: {
        color: "#111827",
        fontSize: 15,
        fontWeight: "600",
        paddingVertical: 0,
        margin: 0,
        includeFontPadding: false,
    },
    locationInputRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    locationField: {
        flex: 1,
    },
    mapButton: {
        width: 48,
        height: 48,
        marginTop: 10,
        borderRadius: 12,
        backgroundColor: "#EEF3FA",
        justifyContent: "center",
        alignItems: "center",
    },
    locationHelpText: {
        color: "#9CA3AF",
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
    bioField: {
        height: 96,
        justifyContent: "flex-start",
        paddingVertical: 12,
    },
    bioInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: "500",
        lineHeight: 20,
    },
    saveButton: {
        height: 54,
        borderRadius: 16,
        backgroundColor: "#1A3A6B",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,

        shadowColor: "#1A3A6B",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.28,
        shadowRadius: 12,
        elevation: 6,
    },
    saveButtonDisabled: {
        backgroundColor: "#A7B3C4",
        shadowOpacity: 0,
        elevation: 0,
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    // 되돌릴 수 없는 동작이라 눈에 덜 띄는 텍스트 버튼으로 둔다.
    withdrawButton: {
        height: 44,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 14,
    },
    withdrawButtonText: {
        color: "#9CA3AF",
        fontSize: 13,
        fontWeight: "600",
        textDecorationLine: "underline",
    }
})
