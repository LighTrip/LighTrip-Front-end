import { BASE_URL } from "./config";

export interface AppleLoginRequest {
    identityToken: string;
    nickname?: string;
    authorizationCode?: string;
}

export interface AppleLoginResponse {
    accessToken: string;
    refreshToken: string;
    isNewUser: boolean;
}

export const loginWithApple = async (
    payload: AppleLoginRequest,
): Promise<AppleLoginResponse> => {
    const response = await fetch(`${BASE_URL}/auth/apple/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        let errorMessage = "애플 로그인 실패";

        try {
            const result = await response.json();
            errorMessage = result.message || errorMessage;
        } catch {}

        throw new Error(errorMessage);
    }

    return response.json();
};
