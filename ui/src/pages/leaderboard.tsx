import { useEffect, useState } from "react";
import { Avatar, Skeleton } from "@heroui/react";
import { Navbar } from "../components";
import { Series, EventType } from "../types";
import { LeaderboardEntry } from "../types/leaderboard";
import Event from "../types/event";
import api from "../api/axios";
import useAuth from "../hooks/use_auth";

interface ScoredPrediction {
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

interface UserPosition {
    position: number;
    entry: LeaderboardEntry;
}

const factionStyle: Record<string, { label: string; color: string; bg: string }> = {
    ENL: { label: "ENL", color: "text-enl-foreground", bg: "bg-enl/30" },
    RES: { label: "RES", color: "text-res-foreground", bg: "bg-res/30" },
};

const displayName = (user: { username?: string; first_name: string; last_name?: string }) =>
    user.username ? `@${user.username}` : [user.first_name, user.last_name].filter(Boolean).join(" ");

const telegramHref = (user: { username?: string; telegram_id?: number }) =>
    user.username ? `https://t.me/${user.username}` : user.telegram_id ? `tg://user?id=${user.telegram_id}` : "#";

const formatPrediction = (p: ScoredPrediction) => {
    if (p.predicted_enl_score != null && p.predicted_res_score != null) {
        return `ENL ${p.predicted_enl_score}% - ${p.predicted_res_score}% RES`;
    }
    return p.predicted_winner ?? "-";
};

const formatActual = (p: ScoredPrediction) => {
    if (p.actual_enl_score != null && p.actual_res_score != null) {
        return `ENL ${p.actual_enl_score}% - ${p.actual_res_score}% RES`;
    }
    return p.actual_winner ?? "TBD";
};

const PAGE_SIZE = 20;

const normalizeLeaderboardResponse = (value: any): { entries: LeaderboardEntry[]; total: number } => {
    const total = value?.total ?? 0;
    if (!value) return { entries: [], total };
    if (Array.isArray(value)) return { entries: value, total };
    if (Array.isArray(value.leaderboard)) return { entries: value.leaderboard, total };
    if (Array.isArray(value.items)) return { entries: value.items, total };
    if (Array.isArray(value.data)) return { entries: value.data, total };
    if (Array.isArray(value.results)) return { entries: value.results, total };
    return { entries: [], total };
};

const Leaderboard = () => {
    const { user } = useAuth();
    const [series, setSeries] = useState<Series[]>([]);
    const [selectedSeriesId, setSelectedSeriesId] = useState<string>("");
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [total, setTotal] = useState(0);
    const [offset, setOffset] = useState(0);
    const [loadingSeries, setLoadingSeries] = useState(true);
    const [loadingEntries, setLoadingEntries] = useState(false);
    const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
    const [scoredPredictions, setScoredPredictions] = useState<ScoredPrediction[]>([]);
    const [loadingUserData, setLoadingUserData] = useState(false);

    useEffect(() => {
        api.get("/series").then((res) => {
            const data: Series[] = res.data;
            setSeries(data);
            if (data.length > 0) setSelectedSeriesId(String(data[0].id));
            setLoadingSeries(false);
        });
    }, []);

    useEffect(() => {
        setOffset(0);
        if (!selectedSeriesId) return;
        setLoadingUserData(true);
        Promise.all([
            api.get(`/leaderboard/${selectedSeriesId}/position`).then(res => res.data as UserPosition).catch(() => null),
            api.get(`/predictions/series/${selectedSeriesId}/scored`).then(res => res.data as ScoredPrediction[]).catch(() => []),
            api.get(`/events/series/${selectedSeriesId}`).then(res => res.data as Event[]).catch(() => []),
            api.get('/events/types').then(res => res.data as EventType[]).catch(() => []),
        ]).then(([position, predictions, events, eventTypes]) => {
            const typeOrderMap = new Map(eventTypes.map(et => [et.id, et.order]));
            const eventTypeOrderMap = new Map(events.map(e => [e.id, typeOrderMap.get(e.type) ?? 0]));
            setUserPosition(position);
            setScoredPredictions([...predictions].sort((a, b) => (eventTypeOrderMap.get(a.event) ?? 0) - (eventTypeOrderMap.get(b.event) ?? 0)));
        }).finally(() => setLoadingUserData(false));
    }, [selectedSeriesId]);

    useEffect(() => {
        if (!selectedSeriesId) return;
        setLoadingEntries(true);
        api
            .get(`/leaderboard/${selectedSeriesId}`, { params: { offset, limit: PAGE_SIZE } })
            .then((res) => {
                const { entries: normalized, total: t } = normalizeLeaderboardResponse(res.data);
                if (normalized.length === 0 && t === 0) {
                    console.warn("Unexpected leaderboard response", res.data);
                }
                setEntries(normalized);
                setTotal(t);
            })
            .catch((err) => {
                console.error("Failed to load leaderboard", err);
                setEntries([]);
                setTotal(0);
            })
            .finally(() => setLoadingEntries(false));
    }, [selectedSeriesId, offset]);

    return (
        <>
            <Navbar />
            <div className="my-5 container px-3 sm:px-0 mx-auto">
                <h1 className="text-2xl font-semibold mb-1">Leaderboard</h1>
                <p className="text-foreground/60 mb-6">Top predictors by series</p>

                {loadingSeries ? (
                    <Skeleton className="h-10 w-64 rounded-lg mb-6" />
                ) : (
                    <select
                        className="mb-6 rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground/40"
                        value={selectedSeriesId}
                        onChange={(e) => setSelectedSeriesId(e.target.value)}
                    >
                        {series.map((s) => (
                            <option key={s.id} value={String(s.id)}>{s.name}</option>
                        ))}
                    </select>
                )}

                {/* User position + scored predictions */}
                {loadingUserData ? (
                    <div className="space-y-2 mb-8">
                        <Skeleton className="h-16 w-full rounded-lg" />
                        <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                ) : userPosition ? (
                    <div className="mb-8 space-y-3">
                        {/* Position card */}
                        <div className="flex items-center gap-4 rounded-lg border border-foreground/40 bg-foreground/5 px-4 py-3">
                            <span className="w-6 text-right font-mono text-sm text-foreground/40 shrink-0">
                                #{userPosition.position}
                            </span>
                            <Avatar size="sm" className={userPosition.entry.faction === "ENL" ? "ring-2 ring-enl shrink-0" : userPosition.entry.faction === "RES" ? "ring-2 ring-res shrink-0" : "shrink-0"}>
                                <Avatar.Image src={userPosition.entry.photo_url} alt={userPosition.entry.first_name} />
                                <Avatar.Fallback>{userPosition.entry.first_name?.[0]}</Avatar.Fallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                                <span className="font-medium text-sm truncate">{displayName(userPosition.entry)}</span>
                                {userPosition.entry.faction && factionStyle[userPosition.entry.faction] && (
                                    <span className={`shrink-0 text-xs font-mono px-1.5 py-0.5 rounded ${factionStyle[userPosition.entry.faction].color} ${factionStyle[userPosition.entry.faction].bg}`}>
                                        {factionStyle[userPosition.entry.faction].label}
                                    </span>
                                )}
                            </div>
                            <span className="font-mono text-sm font-semibold shrink-0">
                                {userPosition.entry.score} pts
                            </span>
                        </div>

                        {/* Scored predictions */}
                        {scoredPredictions.length > 0 && (
                            <div className="rounded-lg border border-foreground/10 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-foreground/10 text-foreground/50 text-xs">
                                            <th className="text-left px-4 py-2 font-medium">Event</th>
                                            <th className="text-left px-4 py-2 font-medium">Predicted</th>
                                            <th className="text-left px-4 py-2 font-medium">Actual</th>
                                            <th className="text-right px-4 py-2 font-medium">Points</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scoredPredictions.map((p) => (
                                            <tr key={p.id} className="border-b border-foreground/5 last:border-0">
                                                <td className="px-4 py-2 font-medium truncate max-w-[180px]">{p.event_name}</td>
                                                <td className="px-4 py-2 text-foreground/70 font-mono text-xs">{formatPrediction(p)}</td>
                                                <td className="px-4 py-2 text-foreground/70 font-mono text-xs">{formatActual(p)}</td>
                                                <td className="px-4 py-2 text-right font-mono font-semibold">
                                                    {p.score != null ? `${p.score} pts` : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : null}

                {/* Main leaderboard */}
                {loadingEntries ? (
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-14 w-full rounded-lg" />
                        ))}
                    </div>
                ) : entries.length === 0 ? (
                    <p className="text-foreground/50 text-sm">No results yet for this series.</p>
                ) : (
                    <div className="space-y-2">
                        {entries.map((entry, index) => {
                            const faction = entry.faction ? factionStyle[entry.faction] : null;
                            return (
                                <div
                                    key={entry.user}
                                    className={`flex items-center gap-4 rounded-lg border px-4 py-3 ${entry.user === user?.id ? "border-foreground/40 bg-foreground/5" : "border-foreground/10"}`}
                                >
                                    <span className="w-6 text-right font-mono text-sm text-foreground/40 shrink-0">
                                        {offset + index + 1}
                                    </span>

                                    <Avatar size="sm" className={entry.faction === "ENL" ? "ring-2 ring-enl shrink-0" : entry.faction === "RES" ? "ring-2 ring-res shrink-0" : "shrink-0"}>
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
                                            <span
                                                className={`shrink-0 text-xs font-mono px-1.5 py-0.5 rounded ${faction.color} ${faction.bg}`}
                                            >
                                                {faction.label}
                                            </span>
                                        )}
                                    </div>

                                    <span className="font-mono text-sm font-semibold shrink-0">
                                        {entry.score} pts
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {total > PAGE_SIZE && (
                    <div className="flex items-center justify-between mt-4">
                        <button
                            className="px-3 py-1.5 text-sm rounded-lg border border-foreground/20 disabled:opacity-40"
                            disabled={offset === 0}
                            onClick={() => setOffset(o => Math.max(0, o - PAGE_SIZE))}
                        >
                            Previous
                        </button>
                        <span className="text-sm text-foreground/50">
                            {offset + 1} - {Math.min(offset + PAGE_SIZE, total)} of {total}
                        </span>
                        <button
                            className="px-3 py-1.5 text-sm rounded-lg border border-foreground/20 disabled:opacity-40"
                            disabled={offset + PAGE_SIZE >= total}
                            onClick={() => setOffset(o => o + PAGE_SIZE)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Leaderboard;
