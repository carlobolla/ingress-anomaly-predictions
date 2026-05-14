import { useState } from 'react';
import api from '@/api/axios';
import type Event from '@/types/event';

interface NotifyResult {
    notified: number;
    skipped: number;
}

interface Props {
    events: Event[];
    loading: boolean;
}

const NotifyScores = ({ events, loading }: Props) => {
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [notifying, setNotifying] = useState(false);
    const [result, setResult] = useState<NotifyResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleNotify = async () => {
        if (selectedEventId === null) return;
        setNotifying(true);
        setResult(null);
        setError(null);
        try {
            const res = await api.post<NotifyResult>(`/admin/events/${selectedEventId}/notify`);
            setResult(res.data);
        } catch (e: unknown) {
            const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
            setError(msg ?? 'Failed to send score notifications.');
        } finally {
            setNotifying(false);
        }
    };

    return (
        <section>
            <h2 className="font-semibold text-base mb-1">Notify event scores</h2>
            <p className="text-foreground/50 text-sm mb-5">
                Send each user their prediction result for a scored event. Only users with notifications enabled will receive a message.
            </p>

            {loading ? (
                <p className="text-foreground/40 text-sm mb-4">Loading events…</p>
            ) : events.length === 0 ? (
                <p className="text-foreground/40 text-sm mb-4">No scored events available.</p>
            ) : (
                <div className="rounded-lg border border-foreground/10 divide-y divide-foreground/10 max-h-64 overflow-y-auto mb-4">
                    {events.map(ev => {
                        const isSelected = selectedEventId === ev.id;
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
                                        {ev.actual_winner && (
                                            <> · winner: <span className={ev.actual_winner === 'ENL' ? 'text-enl-foreground' : 'text-res-foreground'}>{ev.actual_winner}</span></>
                                        )}
                                    </p>
                                </div>
                                {(ev.enl_score != null || ev.res_score != null) && (
                                    <span className="text-xs text-foreground/40 font-mono shrink-0">
                                        {ev.enl_score ?? '–'} / {ev.res_score ?? '–'}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

            {result && (
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 px-4 py-3 mb-4 text-sm">
                    <p className="font-medium">Notified {result.notified} user{result.notified !== 1 ? 's' : ''}</p>
                    {result.skipped > 0 && (
                        <p className="text-xs text-foreground/50 mt-1">{result.skipped} skipped (notifications disabled)</p>
                    )}
                </div>
            )}

            <button
                onClick={handleNotify}
                disabled={notifying || selectedEventId === null}
                className="px-5 py-2 rounded-lg bg-foreground text-background text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
                {notifying ? 'Notifying…' : 'Send score notifications'}
            </button>
        </section>
    );
};

export default NotifyScores;
