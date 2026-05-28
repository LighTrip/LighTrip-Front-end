export type RankingUser = {
    rank: number;
    userId: number;
    nickname: string;
    profileImageUrl: string | null;
    score: number; // 좋아요 * 2 + 스크랩 * 3
};

export type RankingResponse = {
    success: boolean;
    code: string;
    message: string;
    data: {
        topRankings: RankingUser[];
        myRank: RankingUser | null;
    };
};