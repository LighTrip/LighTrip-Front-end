import * as Securestore from "expo-secure-store";
import {
    CreateTeamRequest,
    FriendRequestAction,
    FriendRequestActionRequest,
    JoinTeamRequest,
    MyProfileResponse,
    PendingFriendResponse,
    PresignedUrlRequest,
    PresignedUrlResponse,
    ProfileEditForm,
    ProfileUser,
    TeamApiResponse,
    TeamResponseData,
    UpdateLiveLocationSharingRequest,
    UpdateProfileRequest
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

    if (!response.ok || !result.success) {
        throw new Error(result.message || "내 프로필 조회 실패");
    }

    return result;
};

const extractTeamData = (result: TeamApiResponse): TeamResponseData => {
    const teamData = result.data ?? result;

    if (
        typeof teamData.teamId !== "number" ||
        !teamData.teamName ||
        !teamData.teamCode
    ) {
        throw new Error(result.message || "팀 응답 데이터가 올바르지 않습니다.");
    }

    return {
        teamId: teamData.teamId,
        teamName: teamData.teamName,
        teamCode: teamData.teamCode,
        createdAt: teamData.createdAt ?? "",
    };
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

    if (!response.ok || !result.success) {
        throw new Error(result.message || "프로필 수정 실패");
    }

    return mapMyProfileToEditForm(result.data);
};

// 5. 회원탈퇴 DELETE 요청
export const withdrawMember = async (): Promise<void> => {
    const accessToken = await getAccessToken();

    const response = await fetch(`${BASE_URL}/auth/withdraw`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        }
    });

    if (!response.ok) {
        let errorMessage = "회원탈퇴 실패";

        try {
            const result = await response.json();
            errorMessage = result.message || errorMessage;
        } catch {}

        throw new Error(errorMessage);
    }
};

// 6. 로그아웃 POST 요청
export const logout = async (): Promise<void> => {
    const accessToken = await getAccessToken();

    const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        }
    });

    if (!response.ok) {
        let errorMessage = "로그아웃 실패";

        try {
            const result = await response.json();
            errorMessage = result.message || errorMessage;
        } catch {}

        throw new Error(errorMessage);
    }
};

// 7. 받은 친구 요청 목록 조회
export const getPendingFriends = async (): Promise<PendingFriendResponse["data"]> => {
    const accessToken = await getAccessToken();

    const response = await fetch(`${BASE_URL}/api/v1/friends/pending`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        }
    });

    const result: PendingFriendResponse = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "받은 친구 요청 목록 조회 실패");
    }

    return result.data;
};

// 8. 친구 요청 수락/거절
export const respondFriendRequest = async (
    friendId: number,
    action: FriendRequestAction
): Promise<void> => {
    const accessToken = await getAccessToken();

    const response = await fetch(`${BASE_URL}/api/v1/friends/${friendId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            action,
        } satisfies FriendRequestActionRequest),
    });

    if (!response.ok) {
        let errorMessage = "친구 요청 처리 실패";

        try {
            const result = await response.json();
            errorMessage = result.message || errorMessage;
        } catch {}

        throw new Error(errorMessage);
    }
};

// 9. 팀 생성
export const createTeam = async (
    teamName: string
): Promise<TeamResponseData> => {
    const accessToken = await getAccessToken();

    const response = await fetch(`${BASE_URL}/api/v1/teams`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            teamName,
        } satisfies CreateTeamRequest),
    });

    const result: TeamApiResponse = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "팀 생성 실패");
    }

    const teamData = extractTeamData(result);

    await Securestore.setItemAsync("teamId", String(teamData.teamId));
    await Securestore.setItemAsync("teamCode", teamData.teamCode);
    await Securestore.setItemAsync("teamName", teamData.teamName);

    return teamData;
};

// 10. 팀 코드 검색
export const searchTeamByCode = async (
    code: string
): Promise<TeamResponseData> => {
    const accessToken = await getAccessToken();

    const response = await fetch(
        `${BASE_URL}/api/v1/teams/search?code=${encodeURIComponent(code)}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    const result: TeamApiResponse = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "팀 검색 실패");
    }

    return extractTeamData(result);
};

// 11. 팀 가입
export const joinTeam = async (
    teamCode: string
): Promise<TeamResponseData> => {
    const accessToken = await getAccessToken();

    const response = await fetch(`${BASE_URL}/api/v1/teams/join`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            teamCode,
        } satisfies JoinTeamRequest),
    });

    const result: TeamApiResponse = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "팀 가입 실패");
    }

    const teamData = extractTeamData(result);

    await Securestore.setItemAsync("teamId", String(teamData.teamId));
    await Securestore.setItemAsync("teamCode", teamData.teamCode);
    await Securestore.setItemAsync("teamName", teamData.teamName);

    return teamData;
};

// 12. 위치 공유 온오프 API
export const updateLiveLocationSharing = async (
    teamId: number,
    sharing: boolean
): Promise<void> => {
    const accessToken = await getAccessToken();

    const response = await fetch(
        `${BASE_URL}/api/v1/teams/${teamId}/live-locations/me`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                sharing,
            } satisfies UpdateLiveLocationSharingRequest),
        }
    );

    if (!response.ok) {
        let errorMessage = "위치 공유 설정 변경 실패";

        try {
            const result = await response.json();
            errorMessage = result.message || errorMessage;
        } catch {}

        throw new Error(errorMessage);
    }
};
