import { useState } from 'react';
import api from '@/api/axios';
import type Event from '@/types/event';

interface Props {
    events: Event[];
    loading: boolean;
}

const ScoreEvent = ({ events, loading }: Props) => {
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [scoring, setScoring] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleScore = async () => {
        if (selectedEventId === null) return;
        setScoring(true);
        setSuccess(false);
        setError(null);
        try {
            await api.post(`/events/${selectedEventId}/score`);
            setSuccess(true);
        } catch (e: unknown) {
            const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
            setError(msg ?? 'Failed to calculate scores.');
        } finally {
            setScoring(false);
        }
    };

    return (
        <section>
            <h2 className="font-semibold text-base mb-1">Calculate prediction scores</h2>
            <p className="text-foreground/50 text-sm mb-5">
                Run the scoring RPC for an event. This updates all prediction scores based on the event result.
            </p>

            {loading ? (
                <p className="text-foreground/40 text-sm mb-4">Loading events…</p>
            ) : events.length === 0 ? (
                <p className="text-foreground/40 text-sm mb-4">No events available.</p>
            ) : (
                <div className="rounded-lg border border-foreground/10 divide-y divide-foreground/10 max-h-64 overflow-y-auto mb-4">
                    {events.map(ev => {
                        const isSelected = selectedEventId === ev.id;
                        const scored = ev.enl_score != null || ev.res_score != null;
                        return (
                            <button
                                key={ev.id}
                                onClick={() => setSelectedEventId(isSelected ? null : ev.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-foreground/5 ${isSelected ? 'bg-foreground/5' : ''}`}
                            >
                                <div className={`w-4 h-4 shrink-0 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-foreground border-foreground' : 'border-foreground/30'}`}>
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-background" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{ev.name}</p>
                                    <p className="text-xs text-foreground/50">
                                        {ev.region}
                                        {ev.winner && (
                                            <> · winner: <span className={ev.winner === 'ENL' ? 'text-enl-foreground' : 'text-res-foreground'}>{ev.winner}</span></>
                                        )}
                                    </p>
                                </div>
                                {scored ? (
                                    <span className="text-xs text-foreground/40 font-mono shrink-0">
                                        {ev.enl_score ?? '–'} / {ev.res_score ?? '–'}
                                    </span>
                                ) : (
                                    <span className="text-xs text-foreground/30 shrink-0">unscored</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

            {success && (
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 px-4 py-3 mb-4 text-sm">
                    <p className="font-medium">Scores calculated successfully</p>
                </div>
            )}

            <button
                onClick={handleScore}
                disabled={scoring || selectedEventId === null}
                className="px-5 py-2 rounded-lg bg-foreground text-background text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
                {scoring ? 'Calculating…' : 'Calculate scores'}
            </button>
        </section>
    );
};

export default ScoreEvent;
