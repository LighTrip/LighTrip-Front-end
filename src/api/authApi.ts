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
    console.log("[Apple Login] request body:", JSON.stringify(payload));
    console.log("[Apple Login] identityToken length:", payload.identityToken?.length);

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
            console.log("[Apple Login] error response:", JSON.stringify(result));
            errorMessage = result.message || errorMessage;
        } catch {}

        throw new Error(errorMessage);
    }

    return response.json();
};
