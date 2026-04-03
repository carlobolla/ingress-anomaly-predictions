import { Event, PredictionData } from "../../types";
import PercentagePrediction from "./components/percentage-prediction";
import { isPastCutoff } from "../../utils/cutoff";
import useMediaQuery from "../../hooks/use_media_query";
import dayjs from "dayjs";

type AnomalyEventsProps = {
    events: Event[];
    handlePredictionChange: (id: number, predictionData: PredictionData) => void;
    predictionData?: { [id: number]: PredictionData };
};

const AnomalyEvents = ({ events, handlePredictionChange, predictionData }: AnomalyEventsProps) => {
    const mediaQuery = useMediaQuery('(min-width: 1024px)');

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
};

export default AnomalyEvents;
