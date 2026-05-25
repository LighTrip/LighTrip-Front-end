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