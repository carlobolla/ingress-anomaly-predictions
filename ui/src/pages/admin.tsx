import { useEffect, useState } from 'react';
import Navbar from '@/components/navbar/navbar';
import SendMessage from '@/components/admin/send-message';
import NotifyScores from '@/components/admin/notify-scores';
import ScoreEvent from '@/components/admin/score-event';
import api from '@/api/axios';
import type Event from '@/types/event';

const Admin = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [scoredEvents, setScoredEvents] = useState<Event[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    useEffect(() => {
        api.get<Event[]>('/events/unscored')
            .then(res => {
                setEvents(res.data);
                setScoredEvents(res.data.filter(ev => ev.enl_score != null && ev.res_score != null));
            })
            .catch(() => {})
            .finally(() => setLoadingEvents(false));
    }, []);

    return (
        <>
            <Navbar />
            <div className="my-5 container px-3 sm:px-0 mx-auto max-w-2xl">
                <h1 className="text-2xl font-semibold mb-1">Admin</h1>
                <p className="text-foreground/50 text-sm mb-10">Manage administrative features</p>

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
