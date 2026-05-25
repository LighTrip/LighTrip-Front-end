import * as Securestore from "expo-secure-store";
import type {
    GetPassportFeedParams,
    PassportFeedResponse,
} from "../features/search/types/passport.types";
import { BASE_URL } from "./config";

export async function getPassportFeed(params: GetPassportFeedParams = {}) {
    const token = await Securestore.getItemAsync("accessToken");

    const queryParams = new URLSearchParams();

    if(params.category) {
        queryParams.append("category", params.category)
    }

    if(params.district) {
        queryParams.append("district", params.district)
    }

    if(params.latitude !== undefined) {
        queryParams.append("latitude", String(params.latitude))
    }

    if(params.longitude !== undefined) {
        queryParams.append("longitude", String(params.longitude))
    }

    if(params.radius !== undefined) {
        queryParams.append("radius", String(params.radius))
    }

    if(params.cursor !== null && params.cursor !== undefined) {
        queryParams.append("cursor", String(params.cursor))
    }

    if(params.cursorScore !== null && params.cursorScore !== undefined) {
        queryParams.append("cursorScore", String(params.cursorScore))
    }

    queryParams.append("size", String(params.size ?? 10));

    const url = `${BASE_URL}/api/v1/passports/feed?${queryParams.toString()}`;

    console.log("피드 조회 요청 URL:", url)

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })

    const data: PassportFeedResponse = await response.json();

    console.log("피드 조회 상태 코드:", response.status)
    console.log("피드 조회 응답:", data);

    if(!response.ok || !data.success) {
        throw new Error(data.message || "피드 조회에 실패했습니다.")
    }

    return data.data
}