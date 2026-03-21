import { EventType, Event, PredictionData, Region } from "../types";
import RegionList from "./faction-only-prediction/region-list";
import dayjs from "dayjs";
import PercentagePrediction from "./percentage-prediction/percentage-prediction";
import useMediaQuery from "../hooks/use_media_query";

type EventsContainerProps = {
    events: Event[];
    type: EventType;
    handlePredictionChange: (id: number, predictionData: PredictionData) => void;
    predictionData?: { [id: number]: PredictionData };
};

const EventsContainer = ({ events, type, handlePredictionChange, predictionData }: EventsContainerProps ) => {
    const mediaQuery = useMediaQuery('(min-width: 1024px)');
    
    const groupEventsByRegion = (events: Event[]) => {
        return events.reduce((acc, event) => {
            if (!acc[event.region]) {
                acc[event.region] = [];
            }
            acc[event.region]!.push(event);
            return acc;
        }, {} as { [key in Region]?: Event[] });
    }

    return (
            (() => {
                switch(type) {
                    case EventType.anomaly:
                        return (
                            <div className={mediaQuery ? "grid grid-cols-3 gap-4 w-full" : "grid grid-cols-1 gap-4 w-full"}>
                                {[...events].sort((a, b) => dayjs(a.start_time).unix() - dayjs(b.start_time).unix()).map((event: Event) => (
                                    <PercentagePrediction
                                        key={event.id}
                                        event={event}
                                        onPredictionChange={handlePredictionChange}
                                        prediction={predictionData ? predictionData[event.id] : undefined}
                                        readonly={(event: Event) => dayjs(event.start_time).subtract(24, 'hours') < dayjs()}
                                    />
                                ))}
                            </div>
                        );
                    case EventType.skirmish:
                        return (
                            <div className={mediaQuery ? "grid grid-cols-3 gap-4 w-full" : "grid grid-cols-1 gap-4 w-full"}>
                                {Object.entries(groupEventsByRegion(events)).map(([region, regionEvents]) => (
                                    <div key={region} className="mb-5 w-full">
                                        <RegionList
                                            region={region as Region}
                                            events={regionEvents!} 
                                            onPredictionChange={handlePredictionChange}
                                            predictions={Object.fromEntries(
                                                regionEvents!
                                                    .filter(event => predictionData && predictionData[event.id] !== undefined)
                                                    .map(event => [event.id, predictionData![event.id] as PredictionData])
                                            )}
                                            subtext="A draw or cancellation will result in no points for your prediction. Cutoff date for predictions is 24 hours before the event starts."
                                            readonly={(event: Event) => dayjs(event.start_time).subtract(24, 'hours') < dayjs()}
                                        />
                                    </div>
                                ))}
                            </div>
                        );
                    case EventType.globalchallenge:
                        return (
                            <div className={mediaQuery ? "grid grid-cols-3 gap-4 w-full" : "grid grid-cols-1 gap-4 w-full"}>
                                {[...events].sort((a, b) => dayjs(a.start_time).unix() - dayjs(b.start_time).unix()).map((event: Event) => (
                                    <PercentagePrediction
                                        key={event.id}
                                        event={event}
                                        onPredictionChange={handlePredictionChange}
                                        prediction={predictionData ? predictionData[event.id] : undefined}
                                        readonly={(event: Event) => dayjs(event.end_time).subtract(24, 'hours') < dayjs()}
                                        showEndTime
                                    />
                                ))}
                            </div>
                        );
                    default:
                        return null;
                }
            })()
    );
}

export default EventsContainer;