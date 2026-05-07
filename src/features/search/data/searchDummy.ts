import { RankingUser, SearchUser } from "../types/search.types";

export const searchUserDummy: SearchUser = {
    id: "30421",
    name: "저희이제하조",
    location: "고양시 덕양구",
    profileImage: require("@/assets/images/profile1.jpg"),
};

export const rankingDummy: RankingUser[] = [
    {
        id: "1",
        rank: 1,
        name: "정윤성",
        likeCount: 235,
        profileImage: require("@/assets/images/profile1.jpg"),
    },
    {
        id: "2",
        rank: 2,
        name: "주민재",
        likeCount: 124,
        profileImage: require("@/assets/images/profile2.jpg"),
    },
    {
        id: "3",
        rank: 3,
        name: "곽재현",
        likeCount: 98,
        profileImage: require("@/assets/images/profile1.jpg"),
    },
    {
        id: "4",
        rank: 4,
        name: "이상원",
        likeCount: 87,
        profileImage: require("@/assets/images/profile2.jpg"),
    },
    {
        id: "5",
        rank: 5,
        name: "남보영",
        likeCount: 76,
        profileImage: require("@/assets/images/profile1.jpg"),
    },
    {
        id: "6",
        rank: 6,
        name: "안서연",
        likeCount: 65,
        profileImage: require("@/assets/images/profile2.jpg"),
    },
];