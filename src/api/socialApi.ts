import {
    Friend,
    FriendLight,
    FriendLightClusterPage,
    FriendMapDistrict,
    FriendPassport,
    MutualFriend,
    PublicUserProfile,
    RecommendedFriend,
} from "@/src/features/social/types/social.types";
import * as Securestore from "expo-secure-store";
import { BASE_URL } from "./config";

// 친구 타입
type FriendApiItem = {
    friendId: number;
    userId: number;
    nickname: string;
    profileImg: string | null;
    friendCode: string;
    location: string;
    status: string;
    createdAt: string;
    stampCount?: number;
    passportCount: number;
    mutualFriends: MutualFriend[];
};

// 친구 목록 타입
type FriendListResponse = {
    success: boolean;
    code: string;
    message: string;
    data: FriendApiItem[];
}

// 추천 친구 목록 타입
type RecommendedFriendResponse = {
    success: boolean;
    code: string;
    message: string;
    data: RecommendedFriend[];
};

// 친구 검색 타입
type SearchFriendResponse = {
    success: boolean;
    code: string;
    message: string;
    data: RecommendedFriend;
};

// 친구 추가 타입
type FriendRequestResponse = {
    success: boolean;
    code: string;
    message: string;
    data: unknown;
}

// 친구 삭제 타입
type DeleteFriendResponse = {
    success: boolean;
    code: string;
    message: string;
    data: unknown;
}

// 공개 프로필 타입
type PublicUserProfileResponse = {
    success: boolean;
    code: string;
    message: string;
    data : {
        userId: number;
        nickname: string;
        profileImg: string | null;
    }
}

// 친구 여권 타입
type FriendPassportListResponse = {
    success: boolean;
    code: string;
    message: string;
    data: FriendPassport[];
}

// 친구 지도 타입
type FriendMapResponse = {
    success: boolean;
    code: string;
    message: string;
    data: FriendMapDistrict[];
}

// 친구 불빛 타입
type FriendLightResponse = {
    success: boolean;
    code: string;
    message: string;
    data: FriendLight[];
}

type FriendLightClusterResponse = {
    success: boolean;
    code: string;
    message: string;
    data: FriendLightClusterPage;
};

// 1. 토큰 발급
const getAccessToken = async () => {
    const accessToken = await Securestore.getItemAsync("accessToken");

    if(!accessToken) {
        throw new Error("로그인 토큰이 없습니다.");
    }

    return accessToken;
}
const authHeaders = async () => {
    const accessToken = await getAccessToken();

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
    }
}

// 2. 백엔드 response 프론트 타입과 매핑
const mapFriendApiItemToFriend = (item: FriendApiItem): Friend => {
    return {
        id: String(item.friendId),
        friendId: item.friendId,
        userId: item.userId,
        name: item.nickname,
        profileImg: item.profileImg,
        friendCode: item.friendCode,
        location: item.location,
        status: item.status,
        createdAt: item.createdAt,

        stampCount: item.passportCount ?? 0,
        passportCount: item.passportCount ?? 0,
        mutualFriends: item.mutualFriends ?? [],
    }
}

// 3. 친구 목록 조회
export const getFriends = async (): Promise<Friend[]> => {
    const response = await fetch(`${BASE_URL}/api/v1/friends`, {
        method: "GET",
        headers: await authHeaders()
    });

    const data: FriendListResponse = await response.json();

    console.log("친구 목록 응답 상태:", response.status);
    console.log("친구 목록 응답 데이터:", data);

    if(!response.ok || !data.success) {
        throw new Error(data.message || "친구 목록 조회에 실패했습니다.");
    }

    return data.data.map(mapFriendApiItemToFriend);
};

// 4. 추천 친구 목록 조회
export const getRecommendedFriends = async (): Promise<RecommendedFriend[]> => {
    const response = await fetch(`${BASE_URL}/api/v1/friends/recommendations`, {
        method: "GET",
        headers: await authHeaders()
    })

    const data: RecommendedFriendResponse = await response.json();

    console.log("추천 친구 응답 상태:", response.status);
    console.log("추천 친구 응답 데이터:", data);

    if(!response.ok || !data.success) {
        throw new Error(data.message || "추천 친구 목록 조회 실패");
    }

    return data.data;
};

// 5. 친구 코드 검색
export const searchFriendByCode = async (
    code: string
): Promise<RecommendedFriend> => {
    const requestUrl = `${BASE_URL}/api/v1/friends/search?code=${encodeURIComponent(code)}`;

    const response = await fetch(requestUrl, {
        method: "GET",
        headers: await authHeaders(),
    });

    const data: SearchFriendResponse = await response.json();

    console.log("친구 코드 검색 응답 상태:", response.status);
    console.log("친구 코드 검색 응답 데이터:", data);

    if (!response.ok || !data.success) {
        throw new Error(data.message || "친구 검색 실패");
    }

    return data.data;
};

// 6. 친구 요청 보내기
export const requestFriend = async (friendCode: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/friends/request`, {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({
            friendCode,
        }),
    });

    const data: FriendRequestResponse = await response.json();

    console.log("친구 요청 응답 상태:", response.status);
    console.log("친구 요청 응답 데이터:", data);

    if (!response.ok || !data.success) {
        throw new Error(data.message || "친구 요청에 실패했습니다.");
    }

    return data.data;
};

// 7. 친구 삭제
export const deleteFriend = async (friendId: number) => {
    const response = await fetch(`${BASE_URL}/api/v1/friends/${friendId}`, {
        method: "DELETE",
        headers: await authHeaders(),
    });

    const data: DeleteFriendResponse = await response.json();

    console.log("친구 삭제 응답 상태:", response.status);
    console.log("친구 삭제 응답 데이터:", data);

    if(!response.ok || !data.success) {
        throw new Error(data.message || "친구 삭제에 실패했습니다.");
    }

    return data.data;
}

// 8. 다른 사용자 공개 프로필 조회
export const getPublicUserProfile = async (
    userId: number
): Promise<PublicUserProfile> => {
    const response = await fetch(`${BASE_URL}/api/v1/users/${userId}`, {
        method: "GET",
        headers: await authHeaders(),
    });

    const data: PublicUserProfileResponse = await response.json()

    console.log("공개 프로필 조회 응답 상태:", response.status);
    console.log("공개 프로필 조회 응답 데이터:", data);

    if(!response.ok || !data.success) {
        throw new Error(data.message || "사용자 프로필 조회에 실패했습니다.")
    }

    return data.data;
}

// 9. 친구 여권 목록 조회
/*export const getFriendPassports = async (
    userId: number,
    district?: string,
    page: number = 0,
    size: number = 20,
) : Promise<FriendPassport[]> => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("size", String(size));
    params.append("sort", "visitedAt,desc");

    if (district) {
        params.append("district", district);
    }

    const requestUrl = `${BASE_URL}/api/v1/friends/${userId}/passports?${params.toString()}`;

    const response = await fetch (requestUrl, {
        method: "GET",
        headers: await authHeaders(),
    });

    const data: FriendPassportListResponse = await response.json();

    console.log("친구 여권 목록 조회 응답 상태:", response.status)
    console.log("친구 여권 목록 조회 응답 데이터:", data);

    if(!response.ok || !data.success) {
        throw new Error(data.message || "친구 여권 목록 조회에 실패했습니다.");
    }

    return data.data;
}
*/

// 10. 친구 여권 목록 조회
export const getFriendMap = async (
    userId: number
): Promise<FriendMapDistrict[]> => {
    const response = await fetch(`${BASE_URL}/api/v1/friends/${userId}/map`, {
        method: "GET",
        headers: await authHeaders(),
    });

    const data: FriendMapResponse = await response.json();

    console.log("친구 여권 목록 조회 응답 상태:", response.status);
    console.log("친구 여권 목록 조회 응답 데이터:", data);

    if(!response.ok || !data.success) {
        throw new Error(data.message || "친구 여권 목록 조회에 실패했습니다.");
    }

    return data.data;
};

// 11. 친구 불빛 조회
export const getFriendLights = async (
    userId: number,
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
): Promise<FriendLight[]> => {
    const params = new URLSearchParams();

    params.append("minLat", String(minLat));
    params.append("maxLat", String(maxLat));
    params.append("minLng", String(minLng));
    params.append("maxLng", String(maxLng));

    const requestUrl = `${BASE_URL}/api/v1/lights/${userId}?${params.toString()}`;

    console.log("친구 불빛 조회 요청 URL:", requestUrl);

    const response = await fetch(requestUrl, {
        method: "GET",
        headers: await authHeaders(),
    });

    const data: FriendLightResponse = await response.json();

    console.log("친구 불빛 조회 응답 상태:", response.status);
    console.log("친구 불빛 조회 응답 데이터:", data);

    if (!response.ok || !data.success) {
        throw new Error(data.message || "친구 불빛 조회에 실패했습니다.");
    }

    return data.data ?? [];

}

// 12. 클러스터 API
export const getFriendLightCluster = async (
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
    cursor?: number | null,
    size: number = 10,
    teamId?: number,
): Promise<FriendLightClusterPage> => {
    const params = new URLSearchParams();

    params.append("minLat", String(minLat));
    params.append("maxLat", String(maxLat));
    params.append("minLng", String(minLng));
    params.append("maxLng", String(maxLng));
    params.append("size", String(size));

    if (cursor !== undefined && cursor !== null) {
        params.append("cursor", String(cursor));
    }

    if (teamId !== undefined) {
        params.append("teamId", String(teamId));
    }

    const requestUrl = `${BASE_URL}/api/v1/lights/cluster?${params.toString()}`;

    console.log("불빛 클러스터 상세 요청 URL:", requestUrl);

    const response = await fetch(requestUrl, {
        method: "GET",
        headers: await authHeaders(),
    });

    const data: FriendLightClusterResponse = await response.json();

    console.log("불빛 클러스터 상세 응답 상태:", response.status);
    console.log("불빛 클러스터 상세 응답 데이터:", data);

    if (!response.ok || !data.success) {
        throw new Error(data.message || "클러스터 상세 조회에 실패했습니다.");
    }

    return data.data;
};