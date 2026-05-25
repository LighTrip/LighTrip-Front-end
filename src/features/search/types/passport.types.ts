export type PassportFeedItem = {
    passportId: number;
    writerUserId: number;
    writerNickname: string;
    writerFriendCode: string;
    writerProfileImg: string | null;
    isFriend: boolean;

    imageUrls: string[];

    content: string;
    address: string;
    spaceName: string;
    district: string;
    districtCategory: string;
    districtDisplayName: string;
    category: string;
    categoryDisplayName: string;

    visitedAt: string;

    musicTitle: string | null;
    musicArtist: string | null;

    likeCount: number;
    scrapCount: number;
    popularityScore: number;
    isLiked: boolean;
    isScrapped: boolean;
    distanceKm: number | null;

    createdAt: string;
}

export type PassportFeedResponse = {
    success: boolean;
    code: string;
    message: string;
    data : {
        content: PassportFeedItem[];
        hasNext: boolean;
        nextCursor: number | null;
        nextCursorScore: number | null;
    }
}

export type GetPassportFeedParams = {
    category?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    cursor?: number | null;
    cursorScore?: number | null;
    size?: number;
}