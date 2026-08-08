// 내 프로필에 필요한 타입
export type ProfileUser = {
    id: string;
    name: string;
    location: string;
    districtCount: number; // 방문한 지역 수
    passportCount: number; // 기록 수
    totallike: number; // 좋아요 수
    profileImage: string | null;
};

// 마이페이지 목록에 필요한 타입
export type ProfileMenuItem = {
    id: string;
    title: string;
    description?: string;
    icon: string;
    route?: string;
};

// 프로필 수정 화면에서 필요한 타입
export type MyProfileResponse = {
    success: boolean;
    code: string;
    message: string;
    data: {
        userId: number;
        nickname: string;
        email: string;
        profileImg: string | null;
        friendCode: string;
        location: string | null;
        bio: string | null;
        currentMode: string;
        createdAt: string;
        stats: {
            friendCount: number;
            districtCount: number;
            passportCount: number;
            likeCount: number;
            scrapCount: number;
        };
    };
};

// 프로필 수정 화면용 타입
export type ProfileEditForm = {
    profileImg: string | null;
    email: string;
    userId: string;
    nickname: string;
    location: string;
    bio: string;
};

// 프로필 업로드 요청 타입
export type UpdateProfileRequest = {
    nickname: string;
    profileImg: string | null;
    location: string;
    bio: string;
};

// 이미지 업로드 전 presigned url 전용 요청 타입
export type PresignedUrlRequest = {
    domain: string;
    contentType: string;
};

// 이미지 업로드 전 presigned url 전용 응답 타입
export type PresignedUrlResponse = {
    presignedUrl: string;
    imageUrl: string;
};

// 받은 친구 요청 목록 응답 타입
export type PendingFriendResponse = {
    success: boolean;
    code: string;
    message: string;
    data: PendingFriend[];
};

export type PendingFriend = {
    friendId: number;
    userId: number;
    nickname: string;
    profileImg: string | null;
    friendCode: string;
    location: null;
    status: string;
    createdAt: string;
    passportCount: number;
    mutualFriends: {
        userId: number;
        nickname: string;
        profileImg: string | null;
    }[];
}

// 친구 요청 거절/수락
export type FriendRequestAction = "ACCEPT" | "REJECT";

export type FriendRequestActionRequest = {
    action: FriendRequestAction;
}

// 팀 생성 요청
export type CreateTeamRequest = {
    teamName: string;
};

// 팀 가입 요청
export type JoinTeamRequest = {
    teamCode: string;
};

// 팀 생성/가입 응답 데이터
export type TeamResponseData = {
    teamId: number;
    teamName: string;
    teamCode: string;
    createdAt: string;
};

export type TeamApiResponse = {
    success?: boolean;
    code?: string;
    message?: string;
    data?: TeamResponseData;
} & Partial<TeamResponseData>;

// 위치 공유 온오프 요청
export type UpdateLiveLocationSharingRequest = {
    sharing: boolean;
}
