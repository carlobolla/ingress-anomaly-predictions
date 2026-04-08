import type Event from '@/types/event';
import type { PredictionData } from '@/types/prediction';
import PercentagePrediction from './components/percentage-prediction';
import { isPastCutoff } from '@/utils/cutoff';
import useMediaQuery from '@/hooks/use_media_query';
import dayjs from "dayjs";

type GlobalChallengeEventsProps = {
    events: Event[];
    handlePredictionChange: (id: number, predictionData: PredictionData) => void;
    predictionData?: { [id: number]: PredictionData };
};

const GlobalChallengeEvents = ({ events, handlePredictionChange, predictionData }: GlobalChallengeEventsProps) => {
    const mediaQuery = useMediaQuery('(min-width: 1024px)');

    return (
        <>
            <div className="mb-5">
                <p className="text-slate-400 flex items-center gap-2">
                    Cutoff date for predictions is 24 hours before the event starts (Exceptionally, open until May 1st for Orion).
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
                        actualScore={event.enl_score}
                    />
                ))}
            </div>
        </>
    );
};

export default GlobalChallengeEvents;
