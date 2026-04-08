import Event, { type EventType } from '@/types/event';
import type { PredictionData } from '@/types/prediction';
import SeriesEvents from "./events/series-events";
import AnomalyEvents from "./events/anomaly-events";
import SkirmishEvents from "./events/skirmish-events";
import GlobalChallengeEvents from "./events/global-challenge-events";
import FirstSaturdays from "./events/first_saturdays";

type EventsContainerProps = {
    events: Event[];
    type: EventType;
    handlePredictionChange: (id: number, predictionData: PredictionData) => void;
    predictionData?: { [id: number]: PredictionData };
};

const EventsContainer = ({ events, type, handlePredictionChange, predictionData }: EventsContainerProps) => {
    switch (type.id) {
        case 0: // Series events
            return <SeriesEvents events={events} handlePredictionChange={handlePredictionChange} predictionData={predictionData} />;
        case 1: // Global Challenge events
            return <GlobalChallengeEvents events={events} handlePredictionChange={handlePredictionChange} predictionData={predictionData} />;
        case 2: // Anomaly events
            return <AnomalyEvents events={events} handlePredictionChange={handlePredictionChange} predictionData={predictionData} />;
        case 3: // Skirmish events
            return <SkirmishEvents events={events} handlePredictionChange={handlePredictionChange} predictionData={predictionData} />;
        case 4: // First Saturdays
            return <FirstSaturdays events={events} handlePredictionChange={handlePredictionChange} predictionData={predictionData} />;
        default:
            return null;
    }
};

export default EventsContainer;
