// 팀 기본 정보 관련 타입
export type TeamInfo = {
    teamId: number;
    teamName: string;
    teamCode: string;
    createdAt: string;
};

// 팀원 목록 조회 관련 타입
export type TeamMember = {
    userId: number;
    nickname: string;
    profileImg: string | null;
    role: "LEADER" | "MEMBER";
};

// 팀 실시간 위치 조회 관련 타입
export type TeamLiveLocation = {
    userId: number;
    nickname: string;
    latitude: number;
    longitude: number;
    placeName: string;
    passportId: number;
    timestamp: string;
}