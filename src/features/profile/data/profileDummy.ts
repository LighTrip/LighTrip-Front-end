import { ProfileMenuItem, ProfileUser } from "../types/profile.types";

export const profileUserDummy: ProfileUser = {
    id: "#2026",
    name: "저희이제하조",
    location: "고양시 덕양구",
    passportCount: 0,
    districtCount: 0,
    totallike: 0,
    profileImage: null,
};

export const settingMenuDummy: ProfileMenuItem[] = [
    {
        id: "edit-profile",
        title: "프로필 수정",
        description: "프로필 및 프로필 사진 수정",
        icon: "pencil",
        route: "/profile/profileEdit"
    },
    {
        id: "team",
        title: "팀 생성 및 가입하기",
        description: "팀에 가입 되어있는 경우 생성 불가합니다.",
        icon: "person-add",
    },
    {
        id: "friends",
        title: "친구 추가 및 친구 관리",
        description: "친구 요청을 보내고 받을 수 있습니다.",
        icon: "people",
    },
    {
        id: "scrap",
        title: "스크랩",
        description: "스크랩 누른 장소 모아보기",
        icon: "bookmark",
        route: "/profile/scrap"
    }, 
]

export const accountMenuDummy: ProfileMenuItem[] = [
    {
        id: "privacy",
        title: "개인정보처리방침",
        icon: "lock-closed",
        route: "/profile/privacy",
    },
    {
        id: "terms",
        title: "이용약관",
        icon: "document-text",
        route: "/profile/terms",
    },
    {
        id: "subscribe",
        title: "구독하기",
        icon: "storefront",
        route: "/profile/subscribe"
    },
    {
        id: "logout",
        title: "로그아웃",
        icon: "log-out",
    },
]