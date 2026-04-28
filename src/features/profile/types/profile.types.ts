import { ImageSourcePropType } from "react-native";

export type ProfileUser = {
    id: string;
    name: string;
    location: string;
    lightCount: number;
    locationCount: number;
    totallike: number;
    profileImage: ImageSourcePropType;
};

export type ProfileMenuItem = {
    id: string;
    title: string;
    description?: string;
    icon: string;
    route?: string;
};