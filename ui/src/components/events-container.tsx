import { EventType, Event, PredictionData, Region } from "../types";
import RegionList from "./prediction-region-list/region-list";
import dayjs from "dayjs";
import PercentagePrediction from "./prediction-percentage/percentage-prediction";
import useMediaQuery from "../hooks/use_media_query";
import { FactionOnly } from ".";
import { isPastCutoff } from "../utils/cutoff";

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
                    case EventType.series:
                        return (
                            <>
                                <div className="mb-5">
                                    <p className="text-slate-400 flex items-center gap-2">
                                        Predict the winning faction for the series!
                                    </p>
                                </div>
                                <div className={mediaQuery ? "grid grid-cols-3 gap-4 w-full" : "grid grid-cols-1 gap-4 w-full"}>
                                    {...events.map((event: Event) => (
                                        <FactionOnly
                                            key={event.id}
                                            event={event}
                                            onPredictionChange={handlePredictionChange}
                                            prediction={predictionData ? predictionData[event.id] : undefined}
                                            readonly={isPastCutoff}
                                            showEndTime
                                        />
                                    ))}
                                </div>
                            </>

                        );
                    case EventType.anomaly:
                        return (
                            <>
                                <div className="mb-5">
                                    <p className="text-slate-400 flex items-center gap-2">
                                        A cancellation will result in no points for your prediction.
                                        Cutoff date for predictions is 24 hours before the event starts.
                                    </p>
                                </div>
                                <div className={mediaQuery ? "grid grid-cols-3 gap-4 w-full" : "grid grid-cols-1 gap-4 w-full"}>
                                    {[...events].sort((a, b) => dayjs(a.start_time).unix() - dayjs(b.start_time).unix()).map((event: Event) => (
                                        <PercentagePrediction
                                            key={event.id}
                                            event={event}
                                            onPredictionChange={handlePredictionChange}
                                            prediction={predictionData ? predictionData[event.id] : undefined}
                                            readonly={isPastCutoff}
                                        />
                                    ))}
                                </div>
                            </>
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
                                            subtext="A draw or cancellation will result in no points for your prediction. Cutoff date for predictions is 24 days before the event starts."
                                            readonly={isPastCutoff}
                                        />
                                    </div>
                                ))}
                            </div>
                        );
                    case EventType.globalchallenge:
                        return (
                            <>
                                <div className="mb-5">
                                    <p className="text-slate-400 flex items-center gap-2">
                                        Cutoff date for predictions is 15 days before the event ends.
                                        Limited to the range of 40-60%.
                                    </p>
                                </div>
                                <div className={mediaQuery ? "grid grid-cols-3 gap-4 w-full" : "grid grid-cols-1 gap-4 w-full"}>
                                    {[...events].sort((a, b) => dayjs(a.start_time).unix() - dayjs(b.start_time).unix()).map((event: Event) => (
                                        <PercentagePrediction
                                            key={event.id}
                                            event={event}
                                            onPredictionChange={handlePredictionChange}
                                            prediction={predictionData ? predictionData[event.id] : undefined}
                                            readonly={isPastCutoff}
                                            showEndTime
                                            range={[40, 60]}
                                        />
                                    ))}
                                </div>
                            </>
                        );
                    default:
                        return null;
                }
            })()
    );
}

export default EventsContainer;
