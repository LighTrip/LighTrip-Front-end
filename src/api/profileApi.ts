import * as Securestore from "expo-secure-store";
import {
    MyProfileResponse,
    PresignedUrlRequest,
    PresignedUrlResponse,
    ProfileEditForm,
    ProfileUser,
    UpdateProfileRequest,
} from "../features/profile/types/profile.types";
import { BASE_URL } from "./config";

// 로그인 토큰 얻기
const getAccessToken = async () => {
    const accessToken = await Securestore.getItemAsync("accessToken");

    if (!accessToken) {
        throw new Error("로그인 토큰이 없습니다.");
    }

    return accessToken;
};

// 마이페이지 화면에서 필요한 값 매핑
const mapMyProfileToProfileUser = (
    data: MyProfileResponse["data"]
): ProfileUser => {
    return {
        id: `#${data.userId}`,
        name: data.nickname,
        location: data.location || "위치 미설정",
        passportCount: data.stats.passportCount ?? 0,
        districtCount: data.stats.districtCount ?? 0,
        totallike: data.stats.likeCount ?? 0,
        profileImage: data.profileImg,
    };
};

// 프로필 수정 화면에서 필요한 값 매핑
const mapMyProfileToEditForm = (
    data: MyProfileResponse["data"]
): ProfileEditForm => {
    return {
        profileImg: data.profileImg,
        email: data.email,
        userId: `#${data.userId}`,
        nickname: data.nickname,
        location: data.location || "",
        bio: data.bio || "",
    };
};

// 프로필 조회
const requestMyProfile = async (): Promise<MyProfileResponse> => {
    const accessToken = await getAccessToken();

    const response = await fetch(`${BASE_URL}/api/v1/users/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const result: MyProfileResponse = await response.json();

    console.log("내 프로필 조회 상태:", response.status);
    console.log("내 프로필 조회 응답:", result);

    if (!response.ok || !result.success) {
        throw new Error(result.message || "내 프로필 조회 실패");
    }

    return result;
};

// 1. 마이페이지 메인에서 프로필 조회
export const getMyProfile = async (): Promise<ProfileUser> => {
    const result = await requestMyProfile();

    return mapMyProfileToProfileUser(result.data);
};

// 2. 프로필 수정 화면에서 프로필 조회
export const getMyProfileEditForm = async (): Promise<ProfileEditForm> => {
    const result = await requestMyProfile();

    return mapMyProfileToEditForm(result.data);
};

// 3. presigned URL 발급 + S3 업로드
export const uploadProfileImage = async (
    imageUri: string,
    contentType: string
): Promise<string> => {
    const accessToken = await getAccessToken();

    const presignedResponse = await fetch(
        `${BASE_URL}/api/v1/images/presigned-url`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                domain: "profile",
                contentType,
            } satisfies PresignedUrlRequest),
        }
    );

    const presignedResult: PresignedUrlResponse =
        await presignedResponse.json();

    console.log("Presigned URL 발급 상태:", presignedResponse.status);
    console.log("Presigned URL 발급 응답:", presignedResult);

    if (!presignedResponse.ok) {
        throw new Error("Presigned URL 발급 실패");
    }

    const imageResponse = await fetch(imageUri);
    const imageBlob = await imageResponse.blob();

    const uploadResponse = await fetch(presignedResult.presignedUrl, {
        method: "PUT",
        headers: {
            "Content-Type": contentType,
        },
        body: imageBlob,
    });

    console.log("S3 이미지 업로드 상태:", uploadResponse.status);

    if (!uploadResponse.ok) {
        throw new Error("S3 이미지 업로드 실패");
    }

    return presignedResult.imageUrl;
};

// 4. 프로필 수정 PUT 요청
export const updateMyProfile = async (
    requestBody: UpdateProfileRequest
): Promise<ProfileEditForm> => {
    const accessToken = await getAccessToken();

    const response = await fetch(`${BASE_URL}/api/v1/users/me`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
    });

    const result: MyProfileResponse = await response.json();

    console.log("프로필 수정 상태:", response.status);
    console.log("프로필 수정 응답:", result);

    if (!response.ok || !result.success) {
        throw new Error(result.message || "프로필 수정 실패");
    }

    return mapMyProfileToEditForm(result.data);
};