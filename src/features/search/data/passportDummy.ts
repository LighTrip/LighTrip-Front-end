import type { Place } from "../types/passport.types"

// 임시 더미 데이터
export const passportDummy: Place[] = [
    {
        id: "1",
        name: "렉터스라운지 홍대",
        image: require("@/assets/images/profile1.jpg"),
        district: "마포구",
        date: "2026-03-30",
        category: "카페",
    },
    {
        id: "2",
        name: "다운타우너",
        image: require("@/assets/images/profile2.jpg"),
        district: "용산구",
        date: "2026-03-16",
        category: "식당",
    },
    {
        id: "3",
        name: "포셋 연희",
        image: require("@/assets/images/profile1.jpg"),
        district: "서대문구",
        date: "2026-02-24",
        category: "카페",
    },
    {
        id: "4",
        name: "명동 쇼핑 거리",
        image: require("@/assets/images/profile2.jpg"),
        district: "중구",
        date: "2026-04-12",
        category: "쇼핑",
    },
    {
        id: "5",
        name: "초이다이닝 강남",
        image: require("@/assets/images/profile1.jpg"),
        district: "강남구",
        date: "2026-01-30",
        category: "음식점",
    },
    {
        id: "6",
        name: "카페 드 파리",
        image: require("@/assets/images/profile2.jpg"),
        district: "서초구",
        date: "2026-02-15",
        category: "카페",
    },
]