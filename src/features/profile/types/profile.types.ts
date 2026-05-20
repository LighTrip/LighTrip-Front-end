export type ProfileUser = {
    id: string;
    name: string;
    location: string;
    districtCount: number;
    locationCount: number;
    totallike: number;
    profileImage: string | null;
};

export type ProfileMenuItem = {
    id: string;
    title: string;
    description?: string;
    icon: string;
    route?: string;
};