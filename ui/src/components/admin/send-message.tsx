import { useEffect, useState } from 'react';
import api from '@/api/axios';
import FactionBadge from '@/components/faction-badge';

interface AdminUser {
    id: string;
    first_name: string;
    last_name: string | null;
    username: string | null;
    telegram_id: number;
    faction: string | null;
    role: string;
}

interface SendResult {
    sent: number;
    total: number;
    failed: { id: string; username: string | null; first_name: string; reason: string }[];
}

const SendMessage = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<SendResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.get<AdminUser[]>('/admin/users')
            .then(res => setUsers(res.data))
            .catch(() => setError('Failed to load users.'))
            .finally(() => setLoading(false));
    }, []);

    const allSelected = users.length > 0 && selectedIds.size === users.length;

    const toggleSelectAll = () =>
        setSelectedIds(allSelected ? new Set() : new Set(users.map(u => u.id)));

    const toggleUser = (id: string) =>
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const handleSend = async () => {
        if (!text.trim() || selectedIds.size === 0) return;
        setSending(true);
        setResult(null);
        setError(null);
        try {
            const res = await api.post<SendResult>('/admin/telegram/send', {
                message: text,
                user_ids: Array.from(selectedIds),
            });
            setResult(res.data);
            setText('');
        } catch (e: unknown) {
            const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
            setError(msg ?? 'Failed to send messages.');
        } finally {
            setSending(false);
        }
    };

    const targetLabel = `${selectedIds.size} user${selectedIds.size !== 1 ? 's' : ''}`;

    return (
        <section>
            <h2 className="font-semibold text-base mb-1">Send message</h2>
            <p className="text-foreground/50 text-sm mb-5">Send a custom Telegram message to selected users.</p>

            <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Recipients</p>
                    <button
                        onClick={toggleSelectAll}
                        className="text-xs text-foreground/60 hover:text-foreground transition-colors"
                    >
                        {allSelected ? 'Deselect all' : 'Select all'}
                    </button>
                </div>
                <p className="text-foreground/40 text-xs mb-3">
                    {selectedIds.size === 0 ? 'Select at least one recipient.' : `Sending to ${targetLabel}.`}
                </p>

                {loading ? (
                    <p className="text-foreground/40 text-sm">Loading users…</p>
                ) : (
                    <div className="rounded-lg border border-foreground/10 divide-y divide-foreground/10 max-h-64 overflow-y-auto">
                        {users.map(u => {
                            const checked = selectedIds.has(u.id);
                            const displayName = [u.first_name, u.last_name].filter(Boolean).join(' ');
                            return (
                                <button
                                    key={u.id}
                                    onClick={() => toggleUser(u.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-foreground/5 ${checked ? 'bg-foreground/5' : ''}`}
                                >
                                    <div className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-foreground border-foreground' : 'border-foreground/30'}`}>
                                        {checked && (
                                            <svg className="w-2.5 h-2.5 text-background" viewBox="0 0 10 8" fill="none">
                                                <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{displayName}</p>
                                        {u.username && <p className="text-xs text-foreground/50 truncate">@{u.username}</p>}
                                    </div>
                                    <FactionBadge faction={u.faction} className="ml-auto" />
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="mb-4">
                <p className="text-sm font-medium mb-2">Message</p>
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Write your message…"
                    rows={4}
                    className="w-full rounded-lg border border-foreground/10 bg-transparent px-4 py-3 text-sm placeholder:text-foreground/30 focus:outline-none focus:border-foreground/30 resize-none"
                />
                <p className="text-foreground/40 text-xs mt-1">{text.length} characters</p>
            </div>

            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

            {result && (
                <div className={`rounded-lg border px-4 py-3 mb-4 text-sm ${result.failed.length === 0 ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'}`}>
                    <p className="font-medium">Sent to {result.sent} / {result.total} users</p>
                    {result.failed.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs text-foreground/60">
                            {result.failed.map(f => (
                                <li key={f.id}>{f.first_name}{f.username ? ` (@${f.username})` : ''}: {f.reason}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <button
                onClick={handleSend}
                disabled={sending || !text.trim() || selectedIds.size === 0}
                className="px-5 py-2 rounded-lg bg-foreground text-background text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
                {sending ? 'Sending…' : `Send to ${targetLabel}`}
            </button>
        </section>
    );
};

export default SendMessage;
