export type ProfileUser = {
    id: string;
    name: string;
    location: string;
    districtCount: number; // 방문한 지역 수
    passportCount: number; // 기록 수
    totallike: number; // 좋아요 수
    profileImage: string | null;
};

export type ProfileMenuItem = {
    id: string;
    title: string;
    description?: string;
    icon: string;
    route?: string;
};