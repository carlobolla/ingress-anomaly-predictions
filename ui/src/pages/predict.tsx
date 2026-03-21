import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navbar } from '../components';
import { Button, Modal, ModalContent, ModalBody, ModalHeader, ModalFooter, Alert, Skeleton } from '@heroui/react';
import { useParams } from 'react-router';
import { Event, PredictionData, EventType, Prediction, Series } from '../types';
import api from '../api/axios';
import { EventTypeString } from '../types/event';
import EventsContainer from '../components/events-container';

const Predict = () => {
    const params = useParams();
    const [events, setEvents] = useState<Event[]>([]);
    const [series, setSeries] = useState<Series>();
    const [predictionData, setPredictionData] = useState<{ [id: number]: PredictionData }>({});
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [existingPredictionIds, setExistingPredictionIds] = useState<{ [eventId: number]: number }>({});

    const isDataLoaded = useMemo(() => events.length > 0 && series !== undefined, [events, series]);

    useEffect(() => {
        const initialize = async () => {
            const [predictionsRes, eventsRes, seriesRes] = await Promise.all([
                api.get('/predictions', { params: { series: params.seriesId } }),
                api.get('/events', { params: { series: params.seriesId } }),
                api.get(`/series/${params.seriesId}`),
            ]);
            const existingPredictions: Prediction[] = predictionsRes.data;
            setPredictionData(Object.fromEntries(existingPredictions.map(p => [p.event, { winner: p.winner, enl_score: p.enl_score, res_score: p.res_score }])));
            setExistingPredictionIds(Object.fromEntries(existingPredictions.map(p => [p.event, p.id])));
            setEvents(eventsRes.data);
            setSeries(seriesRes.data);
        }
        initialize();

    }, [params.seriesId]);

    const handlePredictionChange = useCallback((id: number, predictionData: PredictionData) => {
        console.log(`Prediction for event ${id} has been updated:`, predictionData);
        setPredictionData((prev) => ({ ...prev, [id]: predictionData }));
    }, []);

    const onOpenChange = () => setIsOpen(!isOpen);

    const savePrediction = async () => {
        try {
            const allEntries = Object.entries(predictionData);
            const newEntries = allEntries.filter(([eventId]) => existingPredictionIds[Number(eventId)] === undefined);
            const existingEntries = allEntries.filter(([eventId]) => existingPredictionIds[Number(eventId)] !== undefined);

            const requests: Promise<unknown>[] = [];

            if (newEntries.length > 0) {
                const body = newEntries.map(([eventId, data]) => ({ event: Number(eventId), ...data }));
                requests.push(api.post('/predictions', body, { params: { series: params.seriesId } }));
            }

            for (const [eventId, data] of existingEntries) {
                requests.push(api.put('/predictions', data, { params: { id: existingPredictionIds[Number(eventId)] } }));
            }

            await Promise.all(requests);
            setIsVisible(true);
            setIsOpen(false);
        } catch (e) {
            console.error(e);
        }
    }

    const groupEventsByType = (events: Event[]) => {
        return events.reduce((acc, event) => {
            if (!acc[event.type]) {
                acc[event.type] = [];
            }
            acc[event.type]!.push(event);
            return acc;
        }, {} as { [key in EventType]?: Event[] });
    }

    return (
        <div>
            <Navbar />
            <div className="my-5 container px-3 sm:px-0 mx-auto">
                <h1 className="text-2xl font-semibold sm:font-4xl flex"><Skeleton isLoaded={isDataLoaded}>{series?.name} Series</Skeleton></h1>
                {isDataLoaded && 
                    Object.entries(groupEventsByType(events)).map(([type, events]) => (
                        <div key={type}>
                            <h2 className="text-xl font-semibold sm:font-3xl my-5">{EventTypeString[Number(type)]} Events</h2>
                                <EventsContainer
                                    events={events}
                                    type={Number(type)}
                                    handlePredictionChange={handlePredictionChange}
                                    predictionData={predictionData}
                                />
                        </div>
                    ))              
                }
                {isDataLoaded && <Button onPress={() => {setIsOpen(true)}} className='mt-5' variant='ghost' color='primary'>Save prediction</Button>}
            </div>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Save prediction</ModalHeader>
                        <ModalBody>
                            <p>Are you sure you want to save your prediction?</p>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>Cancel</Button>
                            <Button color="primary" onPress={savePrediction}>Save</Button>
                        </ModalFooter>
                    </>
                )}
                </ModalContent>
            </Modal>
            <div className="fixed left-3 bottom-3 flex items-center justify-center">
                <Alert onClose={() => setIsVisible(false)} isVisible={isVisible} color="success" title="Your prediction has been saved!" variant="solid" />
            </div>
        </div>
    );
};

export default Predict;