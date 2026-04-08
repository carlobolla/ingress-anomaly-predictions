import type Event from '@/types/event';
import type { PredictionData } from '@/types/prediction';
import FactionOnly from './components/faction-only';
import { isPastCutoff } from '@/utils/cutoff';
import useMediaQuery from '@/hooks/use_media_query';

type SeriesEventsProps = {
    events: Event[];
    handlePredictionChange: (id: number, predictionData: PredictionData) => void;
    predictionData?: { [id: number]: PredictionData };
};

const SeriesEvents = ({ events, handlePredictionChange, predictionData }: SeriesEventsProps) => {
    const mediaQuery = useMediaQuery('(min-width: 1024px)');

    return (
        <>
            <div className="mb-5">
                <p className="text-slate-400 flex items-center gap-2">
                    Predict the winning faction for the series! Cutoff date for predictions is 24 hours before the first event starts (Exceptionally, open until May 1st for Orion).
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
};

export default SeriesEvents;
