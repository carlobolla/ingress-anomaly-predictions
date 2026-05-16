import supabase from '../db/supabase';
import { EventRow } from '../types/event';
import { PredictionRow } from '../types/prediction';
import { UserRow } from '../types/user';

// Event types that use percentage-based scoring (enl_score / res_score are meaningful)
// 0 = Series (winner-only), 1 = Global Challenge, 2 = Anomaly, 3 = Skirmish (winner-only), 4 = First Saturdays
const PERCENTAGE_TYPES = new Set([1, 2, 4]);

export interface Recipient {
    telegram_id: number;
    first_name: string;
    username: string | null;
    message: string;
}
    
export interface SendResult {
    sent: number;
    total: number;
    failed: { telegram_id: number; first_name: string; username: string | null; reason: string }[];
}

async function sendTelegramMessage(chatId: number, text: string): Promise<void> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN not configured');

    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
    const json = await r.json() as { ok: boolean; description?: string };
    if (!json.ok) throw new Error(json.description ?? 'Telegram error');
}

const CHUNK_SIZE = 25;
const CHUNK_DELAY_MS = 5000;

export async function sendTelegramMessages(recipients: Recipient[]): Promise<SendResult> {
    const allResults: PromiseSettledResult<void>[] = [];

    for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
        const chunk = recipients.slice(i, i + CHUNK_SIZE);
        const chunkResults = await Promise.allSettled(
            chunk.map(async (r) => {
                await sendTelegramMessage(r.telegram_id, r.message);
                console.log(`[telegram] sent to ${r.first_name}${r.username ? ` (@${r.username})` : ''} (telegram_id: ${r.telegram_id})`);
            })
        );
        allResults.push(...chunkResults);

        if (i + CHUNK_SIZE < recipients.length) {
            await new Promise(resolve => setTimeout(resolve, CHUNK_DELAY_MS));
        }
    }

    const succeeded = allResults.filter(r => r.status === 'fulfilled').length;
    const failed: SendResult['failed'] = allResults.flatMap((r, i) => {
        if (r.status === 'rejected') {
            const { telegram_id, first_name, username } = recipients[i];
            return [{ telegram_id, first_name, username, reason: (r as PromiseRejectedResult).reason?.message as string }];
        }
        return [];
    });

    failed.forEach(f =>
        console.error(`[telegram] failed to send to ${f.first_name}${f.username ? ` (@${f.username})` : ''}: ${f.reason}`)
    );
    console.log(`[telegram] done - ${succeeded}/${recipients.length} sent`);

    return { sent: succeeded, total: recipients.length, failed };
}

const NOTIFICATION_FOOTER = '\n\nYou may disable Telegram notifications by visiting your <a href="https://anomalypredictions.crlb.dev/profile">profile settings</a>.';

function composeResultMessage(event: EventRow, prediction: PredictionRow, firstName: string, seriesName: string): string {
    const eventLabel = `${seriesName} - ${event.name}`;
    const scoreStr = prediction.score != null
        ? `\n\nYou scored ${prediction.score} point${prediction.score !== 1 ? 's' : ''} for this prediction.`
        : '';

    if (PERCENTAGE_TYPES.has(event.type)) {
        const predText = prediction.enl_score != null
            ? `${prediction.enl_score}% ENL / ${100 - prediction.enl_score}% RES`
            : '-';
        const actualText = event.enl_score != null
            ? `${event.enl_score}% ENL / ${100 - event.enl_score}% RES`
            : 'not yet available';
        return `Hi ${firstName}! Results are in for "${eventLabel}".\n\nYour prediction: ${predText}\nActual result: ${actualText}${scoreStr}${NOTIFICATION_FOOTER}`;
    }

    // Winner-only (Series type 0, Skirmish type 3)
    const predWinner = prediction.winner ?? 'no prediction';
    const actualWinner = event.winner ?? 'not yet available';
    return `Hi ${firstName}! Results are in for "${eventLabel}".\n\nYour prediction: ${predWinner}\nActual winner: ${actualWinner}${scoreStr}${NOTIFICATION_FOOTER}`;
}

export async function notifyEventResults(eventId: number): Promise<SendResult> {
    const { data: event, error: eventError } = await supabase
        .from('event')
        .select('id, name, type, enl_score, res_score, winner, series(name)')
        .eq('id', eventId)
        .single();

    if (eventError || !event) throw new Error(eventError?.message ?? 'Event not found');

    const seriesName = (event.series as unknown as { name: string } | null)?.name ?? '';

    const { data: predictions, error: predError } = await supabase
        .from('prediction')
        .select('winner, enl_score, res_score, score, user(telegram_id, first_name, username)')
        .eq('event', eventId);

    if (predError) throw new Error(predError.message);
    if (!predictions || predictions.length === 0) return { sent: 0, total: 0, failed: [] };

    const isPercentageType = PERCENTAGE_TYPES.has(event.type);
    const activePredictions = predictions.filter(p =>
        isPercentageType ? p.enl_score != null : p.winner != null
    );

    if (activePredictions.length === 0) return { sent: 0, total: 0, failed: [] };

    console.log(`[telegram] notifying ${activePredictions.length} user(s) about results for event #${eventId} "${event.name}"`);

    const recipients: Recipient[] = activePredictions.map((p) => {
        const user = p.user as unknown as UserRow;
        return {
            ...user,
            message: composeResultMessage(event as EventRow, p as PredictionRow, user.first_name, seriesName),
        };
    });

    return sendTelegramMessages(recipients);
}
