import { useEffect, useState } from "react";
import { Skeleton } from "@heroui/react";
import { Navbar } from "../components";
import { Series, EventType } from "../types";
import { LeaderboardEntry } from "../types/leaderboard";
import Event from "../types/event";
import api from "../api/axios";
import useAuth from "../hooks/use_auth";
import { ScoredPrediction, UserPosition } from "../components/leaderboard/leaderboard-helpers";
import UserPositionCard from "../components/leaderboard/user-position-card";
import ScoredPredictionsTable from "../components/leaderboard/scored-predictions-table";
import LeaderboardRow from "../components/leaderboard/leaderboard-row";

const PAGE_SIZE = 20;

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
                setEntries(res.data?.leaderboard ?? []);
                setTotal(res.data?.total ?? 0);
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

                {loadingUserData ? (
                    <div className="space-y-2 mb-8">
                        <Skeleton className="h-16 w-full rounded-lg" />
                        <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                ) : userPosition ? (
                    <div className="mb-8 space-y-3">
                        <UserPositionCard userPosition={userPosition} />
                        <ScoredPredictionsTable predictions={scoredPredictions} />
                    </div>
                ) : null}

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
                        {entries.map((entry, index) => (
                            <LeaderboardRow
                                key={entry.user}
                                entry={entry}
                                rank={offset + index + 1}
                                isCurrentUser={entry.user === user?.id}
                            />
                        ))}
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
