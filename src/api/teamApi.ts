import type { TeamInfo, TeamLiveLocation, TeamMember } from "@/src/features/team/types/team.types";
import * as Securestore from "expo-secure-store";
import { BASE_URL } from "./config";

type TeamInfoResponse = {
    success?: boolean;
    code?: string;
    message?: string;
    data?: TeamInfo;
} & Partial<TeamInfo>;

// 로그인 토큰 얻기
const getAccessToken = async () => {
    const accessToken = await Securestore.getItemAsync("accessToken");

    if (!accessToken) {
        throw new Error("로그인 토큰이 없습니다.");
    }

    return accessToken;
};

const extractTeamInfo = (result: TeamInfoResponse): TeamInfo => {
    const teamInfo = result.data ?? result;

    if (
        typeof teamInfo.teamId !== "number" ||
        !teamInfo.teamName ||
        !teamInfo.teamCode
    ) {
        throw new Error(result.message || "팀 정보를 확인할 수 없습니다.");
    }

    return {
        teamId: teamInfo.teamId,
        teamName: teamInfo.teamName,
        teamCode: teamInfo.teamCode,
        createdAt: teamInfo.createdAt ?? "",
    };
};

const saveTeamInfo = async (teamInfo: TeamInfo) => {
    await Securestore.setItemAsync("teamId", String(teamInfo.teamId));
    await Securestore.setItemAsync("teamCode", teamInfo.teamCode);
    await Securestore.setItemAsync("teamName", teamInfo.teamName);
};

// 1. 팀 기본 정보 조회 API
export const getTeamInfo = async (
    teamId: number
): Promise<TeamInfo> => {
    const accessToken = await getAccessToken();

    const response = await fetch(`${BASE_URL}/api/v1/teams/${teamId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const result: TeamInfoResponse = await response.json();

    console.log("팀 정보 조회 상태:", response.status);
    console.log("팀 정보 조회 응답:", result);

    if (!response.ok) {
        throw new Error(result.message || "팀 정보 조회 실패");
    }

    return extractTeamInfo(result);
};

export const getMyTeam = async (): Promise<TeamInfo> => {
    const accessToken = await getAccessToken();

    const response = await fetch(`${BASE_URL}/api/v1/teams/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const result: TeamInfoResponse = await response.json();

    console.log("내 팀 정보 조회 상태:", response.status);
    console.log("내 팀 정보 조회 응답:", result);

    if (!response.ok) {
        throw new Error(result.message || "내 팀 정보 조회 실패");
    }

    const teamInfo = extractTeamInfo(result);
    await saveTeamInfo(teamInfo);

    return teamInfo;
};

// 2. 팀 탈퇴
export const leaveTeam = async (
    teamId: number
): Promise<void> => {
    const accessToken = await getAccessToken();

    const response = await fetch(`${BASE_URL}/api/v1/teams/${teamId}/members/me`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    console.log("팀 탈퇴 상태:", response.status);

    if (!response.ok) {
        let errorMessage = "팀 탈퇴 실패";

        try {
            const result = await response.json();
            console.log("팀 탈퇴 에러 응답:", result);
            errorMessage = result.message || errorMessage;
        } catch {
            console.log("팀 탈퇴 응답 body 없음");
        }

        throw new Error(errorMessage);
    }

    await Securestore.deleteItemAsync("teamId");
    await Securestore.deleteItemAsync("teamCode");
    await Securestore.deleteItemAsync("teamName");
};

// 3. 팀 멤버 목록 조회
export const getTeamMembers = async (
    teamId: number
): Promise<TeamMember[]> => {
    const accessToken = await getAccessToken();

    const response = await fetch(`${BASE_URL}/api/v1/teams/${teamId}/members`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const result = await response.json();

    console.log("팀 멤버 목록 조회 상태:", response.status);
    console.log("팀 멤버 목록 조회 응답:", result);

    if (!response.ok) {
        throw new Error(result.message || "팀 멤버 목록 조회 실패");
    }

    return result as TeamMember[];
};

// 4. 팀 실시간 위치 조회 
export const getTeamLiveLocations = async (
    teamId: number
): Promise<TeamLiveLocation[]> => {
    const accessToken = await getAccessToken();

    const response = await fetch(
        `${BASE_URL}/api/v1/teams/${teamId}/live-locations`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    const result = await response.json();

    console.log("팀 실시간 위치 조회 상태:", response.status);
    console.log("팀 실시간 위치 조회 응답:", result);

    if (!response.ok) {
        throw new Error(result.message || "팀 실시간 위치 조회 실패");
    }

    return result as TeamLiveLocation[];
};
