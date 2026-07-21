import { useState } from 'react';
import api from '@/api/axios';
import type Event from '@/types/event';

interface Props {
    events: Event[];
    loading: boolean;
    onResultAdded: (event: Event) => void;
}

const FACTION_ONLY_TYPES = [0, 3]; // Series Winner, Skirmish

const AddEventResult = ({ events, loading, onResultAdded }: Props) => {
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [winner, setWinner] = useState<'ENL' | 'RES' | null>(null);
    const [enlScore, setEnlScore] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedEvent = events.find(ev => ev.id === selectedEventId) ?? null;
    const isFactionOnly = selectedEvent != null && FACTION_ONLY_TYPES.includes(selectedEvent.type);

    const selectEvent = (id: number) => {
        setSelectedEventId(prev => (prev === id ? null : id));
        setWinner(null);
        setEnlScore('');
        setSuccess(false);
        setError(null);
    };

    const canSubmit = selectedEvent != null && (isFactionOnly ? winner !== null : enlScore.trim() !== '');

    const handleSubmit = async () => {
        if (!selectedEvent) return;
        setSubmitting(true);
        setSuccess(false);
        setError(null);
        try {
            const body = isFactionOnly
                ? { winner }
                : { enl_score: Number(enlScore), res_score: 100 - Number(enlScore), winner: Number(enlScore) === 50 ? null : Number(enlScore) > 50 ? 'ENL' : 'RES' };
            const res = await api.patch<Event>(`/events/${selectedEvent.id}/result`, body);
            setSuccess(true);
            onResultAdded({ ...selectedEvent, ...res.data });
            setSelectedEventId(null);
            setWinner(null);
            setEnlScore('');
        } catch (e: unknown) {
            const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
            setError(msg ?? 'Failed to save event result.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section>
            <h2 className="font-semibold text-base mb-1">Add event results</h2>
            <p className="text-foreground/50 text-sm mb-5">
                Enter the actual result for an event. This does not score predictions on its own — use
                "Calculate prediction scores" below once the result is set.
            </p>

            {loading ? (
                <p className="text-foreground/40 text-sm mb-4">Loading events…</p>
            ) : events.length === 0 ? (
                <p className="text-foreground/40 text-sm mb-4">No events pending results.</p>
            ) : (
                <div className="rounded-lg border border-foreground/10 divide-y divide-foreground/10 max-h-64 overflow-y-auto mb-4">
                    {events.map(ev => {
                        const isSelected = selectedEventId === ev.id;
                        return (
                            <button
                                key={ev.id}
                                onClick={() => selectEvent(ev.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-foreground/5 ${isSelected ? 'bg-foreground/5' : ''}`}
                            >
                                <div className={`w-4 h-4 shrink-0 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-foreground border-foreground' : 'border-foreground/30'}`}>
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-background" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{ev.name}</p>
                                    <p className="text-xs text-foreground/50">{ev.region}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {selectedEvent && (
                <div className="rounded-lg border border-foreground/10 p-4 mb-4">
                    {isFactionOnly ? (
                        <div>
                            <p className="text-sm font-medium mb-3">Winning faction</p>
                            <div className="flex gap-2">
                                {(['ENL', 'RES'] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setWinner(f)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                            winner === f
                                                ? f === 'ENL'
                                                    ? 'bg-enl text-white border-enl'
                                                    : 'bg-res text-white border-res'
                                                : 'border-foreground/20 hover:bg-foreground/5'
                                        }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="text-sm font-medium mb-3 block" htmlFor="enl-score-input">
                                ENL percentage
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    id="enl-score-input"
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={0.1}
                                    value={enlScore}
                                    onChange={(e) => setEnlScore(e.target.value)}
                                    placeholder="e.g. 62"
                                    className="w-28 rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground/40"
                                />
                                <span className="text-sm text-foreground/50">
                                    ENL {enlScore.trim() !== '' && !isNaN(Number(enlScore)) ? Number(enlScore) : '–'}% / RES {enlScore.trim() !== '' && !isNaN(Number(enlScore)) ? 100 - Number(enlScore) : '–'}%
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

            {success && (
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 px-4 py-3 mb-4 text-sm">
                    <p className="font-medium">Event result saved</p>
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={submitting || !canSubmit}
                className="px-5 py-2 rounded-lg bg-foreground text-background text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
                {submitting ? 'Saving…' : 'Save result'}
            </button>
        </section>
    );
};

export default AddEventResult;
