import { useEffect, useState } from 'react';
import Navbar from '@/components/navbar/navbar';
import SendMessage from '@/components/admin/send-message';
import NotifyScores from '@/components/admin/notify-scores';
import ScoreEvent from '@/components/admin/score-event';
import AddEventResult from '@/components/admin/add-event-result';
import api from '@/api/axios';
import type Event from '@/types/event';

const Admin = () => {
    const [pendingResultEvents, setPendingResultEvents] = useState<Event[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [scoredEvents, setScoredEvents] = useState<Event[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get<Event[]>('/events/pending-results').then(res => res.data).catch(() => []),
            api.get<Event[]>('/events/unscored').then(res => res.data).catch(() => []),
            api.get<Event[]>('/events/notifiable').then(res => res.data).catch(() => []),
        ]).then(([pendingResults, unscored, notifiable]) => {
            setPendingResultEvents(pendingResults);
            setEvents(unscored);
            setScoredEvents(notifiable);
        }).finally(() => setLoadingEvents(false));
    }, []);

    return (
        <>
            <Navbar />
            <div className="my-5 container px-3 sm:px-0 mx-auto max-w-2xl">
                <h1 className="text-2xl font-semibold mb-1">Admin</h1>
                <p className="text-foreground/50 text-sm mb-10">Manage administrative features</p>

                <AddEventResult
                    events={pendingResultEvents}
                    loading={loadingEvents}
                    onResultAdded={(eventId) => setPendingResultEvents(prev => prev.filter(ev => ev.id !== eventId))}
                />

                <div className="border-t border-foreground/10 my-10" />

                <ScoreEvent events={events} loading={loadingEvents} />

                <div className="border-t border-foreground/10 my-10" />

                <NotifyScores events={scoredEvents} loading={loadingEvents} />

                <div className="border-t border-foreground/10 my-10" />

                <SendMessage />
            </div>
        </>
    );
};

export default Admin;
