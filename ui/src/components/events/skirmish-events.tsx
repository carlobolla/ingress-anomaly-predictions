import { Event, PredictionData, Region } from "../../types";
import RegionList from "./components/region-list";
import { isPastCutoff } from "../../utils/cutoff";
import useMediaQuery from "../../hooks/use_media_query";

type SkirmishEventsProps = {
    events: Event[];
    handlePredictionChange: (id: number, predictionData: PredictionData) => void;
    predictionData?: { [id: number]: PredictionData };
};

const groupEventsByRegion = (events: Event[]) => {
    return events.reduce((acc, event) => {
        if (!acc[event.region]) {
            acc[event.region] = [];
        }
        acc[event.region]!.push(event);
        return acc;
    }, {} as { [key in Region]?: Event[] });
};

const SkirmishEvents = ({ events, handlePredictionChange, predictionData }: SkirmishEventsProps) => {
    const mediaQuery = useMediaQuery('(min-width: 1024px)');

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
};

export default SkirmishEvents;
