import { AddFriend } from "../types/social.types";

const profile1 = require("../../../../assets/images/profile1.jpg");
const profile2 = require("../../../../assets/images/profile2.jpg");

export const addFriendDummy: AddFriend[] = [
    {
        id: "9",
        name: "박서준",
        stampCount: 78,
        together: "김민재와 함께",
        phone: "010-1234-5678", 
        image: profile1,
    },
    {
        id: "10",
        name: "이지은",
        stampCount: 92,
        together: "최유진 외 1명과 함께",
        phone: "010-1234-5678", 
        image: profile2,
    },
    {
        id: "11",
        name: "강태양",
        stampCount: 134,
        together: "박서준과 함께",
        phone: "010-1234-5678", 
        image: profile1,
    },
    {
        id: "12",
        name: "윤서아",
        stampCount: 56,
        together: "이지은과 함께",
        phone: "010-1234-5678", 
        image: profile2,
    },
    {
        id: "13",
        name: "저희이제하조",
        stampCount: 56,
        together: "OOO과 함께",
        phone: "010-0000-0000", 
        image: profile2,
    },
]