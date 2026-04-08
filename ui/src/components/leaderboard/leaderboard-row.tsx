import { Avatar } from "@heroui/react";
import { LeaderboardEntry } from "../../types/leaderboard";
import { factionStyle, displayName, telegramHref } from "./leaderboard-helpers";

interface Props {
    entry: LeaderboardEntry;
    rank: number;
    isCurrentUser: boolean;
}

const LeaderboardRow = ({ entry, rank, isCurrentUser }: Props) => {
    const faction = entry.faction ? factionStyle[entry.faction] : null;

    return (
        <div className={`flex items-center gap-4 rounded-lg border px-4 py-3 ${isCurrentUser ? "border-foreground/40 bg-foreground/5" : "border-foreground/10"}`}>
            <span className="w-6 text-right font-mono text-sm text-foreground/40 shrink-0">
                {rank}
            </span>
            <Avatar
                size="sm"
                className={entry.faction === "ENL" ? "ring-2 ring-enl shrink-0" : entry.faction === "RES" ? "ring-2 ring-res shrink-0" : "shrink-0"}
            >
                <Avatar.Image src={entry.photo_url} alt={entry.first_name} />
                <Avatar.Fallback>{entry.first_name?.[0]}</Avatar.Fallback>
            </Avatar>
            <div className="flex-1 min-w-0 flex items-center gap-2">
                <a
                    href={telegramHref(entry)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-sm truncate hover:underline underline-offset-2"
                >
                    {displayName(entry)}
                </a>
                {faction && (
                    <span className={`shrink-0 text-xs font-mono px-1.5 py-0.5 rounded ${faction.color} ${faction.bg}`}>
                        {faction.label}
                    </span>
                )}
            </div>
            <span className="font-mono text-sm font-semibold shrink-0">
                {entry.score} pts
            </span>
        </div>
    );
};

export default LeaderboardRow;
