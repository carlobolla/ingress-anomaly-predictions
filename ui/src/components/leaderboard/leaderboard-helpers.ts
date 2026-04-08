import { LeaderboardEntry } from "../../types/leaderboard";

export interface ScoredPrediction {
    id: number;
    event: number;
    event_name: string;
    predicted_winner: string | null;
    predicted_enl_score: number | null;
    predicted_res_score: number | null;
    score: number | null;
    actual_winner: string | null;
    actual_enl_score: number | null;
    actual_res_score: number | null;
}

export interface UserPosition {
    position: number;
    entry: LeaderboardEntry;
}

export const factionStyle: Record<string, { label: string; color: string; bg: string }> = {
    ENL: { label: "ENL", color: "text-enl-foreground", bg: "bg-enl/30" },
    RES: { label: "RES", color: "text-res-foreground", bg: "bg-res/30" },
};

export const displayName = (user: { username?: string; first_name: string; last_name?: string }) =>
    user.username ? `@${user.username}` : [user.first_name, user.last_name].filter(Boolean).join(" ");

export const telegramHref = (user: { username?: string; telegram_id?: number }) =>
    user.username ? `https://t.me/${user.username}` : user.telegram_id ? `tg://user?id=${user.telegram_id}` : "#";
