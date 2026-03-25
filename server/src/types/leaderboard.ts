export interface LeaderboardEntry {
    user: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    faction?: string;
    score: number;
}

export interface LeaderboardBySeriesEntry extends LeaderboardEntry {
    series: string;
}