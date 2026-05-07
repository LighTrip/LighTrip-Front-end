export type SearchTab = "all" | "ranking";

export type SearchUser = {
    id: string;
    name: string;
    location: string;
    profileImage: any;
};

export type RankingUser = {
    id: string;
    rank: number;
    name: string;
    likeCount: number;
    profileImage: any;
};