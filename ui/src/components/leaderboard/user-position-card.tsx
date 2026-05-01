import { Avatar } from "@heroui/react";
import { UserPosition, displayName } from "./leaderboard-helpers";
import FactionBadge from "@/components/faction-badge";

interface Props {
    userPosition: UserPosition;
}

const UserPositionCard = ({ userPosition }: Props) => {
    const { position, entry } = userPosition;
    return (
        <div className="flex items-center gap-4 rounded-lg border border-foreground/40 bg-foreground/5 px-4 py-3">
            <span className="w-6 text-right font-mono text-sm text-foreground/40 shrink-0">
                #{position}
            </span>
            <Avatar
                size="sm"
                className={entry.faction === "ENL" ? "ring-2 ring-enl shrink-0" : entry.faction === "RES" ? "ring-2 ring-res shrink-0" : "shrink-0"}
            >
                <Avatar.Image src={entry.photo_url} alt={entry.first_name} />
                <Avatar.Fallback>{entry.first_name?.[0]}</Avatar.Fallback>
            </Avatar>
            <div className="flex-1 min-w-0 flex items-center gap-2">
                <span className="font-medium text-sm truncate">{displayName(entry)}</span>
                <FactionBadge faction={entry.faction} />
            </div>
            <span className="font-mono text-sm font-semibold shrink-0">
                {entry.score} pts
            </span>
        </div>
    );
};

export default UserPositionCard;
