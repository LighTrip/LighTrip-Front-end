import { ImageSourcePropType } from "react-native";

export type MutualFriend = {
    userId: number;
    nickname: string;
    profileImg: string | null;
};

export type Friend = {
    id: string; // 번호
    friendId: number; // 친구 아이디 번호
    userId: number // 사용자 아이디 번호
    name: string; // 사용자 닉네임
    profileImg: string | null; //프로필 이미지
    friendCode: string; // 친구 코드
    status: string;
    createdAt: string;

    stampCount: number; // 도장 개수
    passportCount: number; // 여권 개수
    mutualFriends?: MutualFriend[]; // 함께 아는 친구

    image?: ImageSourcePropType; // 사진
    isSelected?: boolean; // 카드 선택되었을 때
};

export type RecommendedFriend = {
    friendId: number;
    userId: number;
    nickname: string;
    profileImg: string | null;
    friendCode: string;
    status: string;
    createdAt: string;

    stampCount?: number; // 도장 개수
    mutualFriends?: MutualFriend[]; // 함께 아는 친구
    image?: ImageSourcePropType; // 사진
}