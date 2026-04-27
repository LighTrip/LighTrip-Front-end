import { ImageSourcePropType } from "react-native";

export type Friend = {
    id: string; // 사용자 아이디 번호
    name: string; // 사용자 닉네임
    stampCount: number; // 도장 개수
    passportCount: number; // 여권 개수
    together: string; // 함께 하는 친구 수
    image: ImageSourcePropType; // 사진
    isSelected?: boolean; // 카드 선택되었을 때
};