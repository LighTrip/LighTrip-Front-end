
export type MutualFriend = {
    userId: number;
    nickname: string;
    profileImg: string | null;
};

export type Friend = {
    id: string; // 번호
    friendId: number; // 친구 아이디 번호
    userId: number // 사용자 아이디 번호
    name: string; // 사용자 닉네임
    profileImg: string | null; //프로필 이미지
    friendCode: string; // 친구 코드
    location: string;
    status: string;
    createdAt: string;

    stampCount: number; // 도장 개수
    passportCount: number; // 여권 개수
    mutualFriends: MutualFriend[]; // 함께 아는 친구
};

export type RecommendedFriend = {
    friendId: number;
    userId: number;
    nickname: string;
    profileImg: string | null;
    friendCode: string;
    status: string;
    createdAt: string;

    passportCount?: number; // 도장 개수
    mutualFriends?: MutualFriend[]; // 함께 아는 친구
}

export type PublicUserProfile = {
    userId: number;
    nickname: string;
    profileImg: string | null;
}

// 친구 여권 열람 관련 타입
export type FriendPassport = {
    passportId: number;
    spaceName: string;
    address: string;
    category: string;
    district: string;
    visitedAt: string;
    content: string;
    imageUrls: string[];
    likeCount: number;
    scrapCount: number;
};

// 친구 지도 열람 관련 타입
export type FriendMapDistrict = {
    districtCategory: string;
    displayName: string;
    passportCount: number;
    thumbnailUrl: string;
    textColor: string;
    coverId: number;
}

// 친구 불빛
export type FriendLight = {
    passportId: number;
    latitude: number;
    longitude: number;
    category: string;
    districtCategory: string;
    spaceName: string;
    thumbnailUrl: string;
    visitedAt: string;
    likeCount: number;
    scrapCount: number;
    isCluster: boolean;
    count: number;
    centerLatitude: number;
    centerLongitude: number;
}