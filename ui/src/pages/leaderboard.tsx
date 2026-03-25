import { useEffect, useState } from "react";
import { Skeleton } from "@heroui/react";
import { Navbar } from "../components";
import { Series } from "../types";
import { LeaderboardEntry } from "../types/leaderboard";
import api from "../api/axios";

const factionStyle: Record<string, { label: string; color: string; bg: string }> = {
    ENL: { label: "ENL", color: "text-enl-foreground", bg: "bg-enl/30" },
    RES: { label: "RES", color: "text-res-foreground", bg: "bg-res/30" },
};

const displayName = (user: { username?: string; first_name: string; last_name?: string }) =>
    user.username ? `@${user.username}` : [user.first_name, user.last_name].filter(Boolean).join(" ");

const telegramHref = (user: { username?: string; telegram_id?: number }) =>
    user.username ? `https://t.me/${user.username}` : user.telegram_id ? `tg://user?id=${user.telegram_id}` : "#";

const normalizeLeaderboardResponse = (value: any): LeaderboardEntry[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (Array.isArray(value.items)) return value.items;
    if (Array.isArray(value.data)) return value.data;
    if (Array.isArray(value.results)) return value.results;
    if (Array.isArray(value.leaderboard)) return value.leaderboard;
    return [];
};

const Leaderboard = () => {
    const [series, setSeries] = useState<Series[]>([]);
    const [selectedSeriesId, setSelectedSeriesId] = useState<string>("");
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loadingSeries, setLoadingSeries] = useState(true);
    const [loadingEntries, setLoadingEntries] = useState(false);

    useEffect(() => {
        api.get("/series").then((res) => {
            const data: Series[] = res.data;
            setSeries(data);
            if (data.length > 0) setSelectedSeriesId(String(data[0].id));
            setLoadingSeries(false);
        });
    }, []);

    useEffect(() => {
        if (!selectedSeriesId) return;
        setLoadingEntries(true);
        api
            .get("/leaderboard", { params: { series: selectedSeriesId } })
            .then((res) => {
                const normalized = normalizeLeaderboardResponse(res.data);
                if (normalized.length === 0) {
                    console.warn("Unexpected leaderboard response", res.data);
                }
                setEntries(normalized);
            })
            .catch((err) => {
                console.error("Failed to load leaderboard", err);
                setEntries([]);
            })
            .finally(() => setLoadingEntries(false));
    }, [selectedSeriesId]);

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
                                    className="flex items-center gap-4 rounded-lg border border-foreground/10 px-4 py-3"
                                >
                                    <span className="w-6 text-right font-mono text-sm text-foreground/40 shrink-0">
                                        {index + 1}
                                    </span>

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
            </div>
        </>
    );
};

export default Leaderboard;
