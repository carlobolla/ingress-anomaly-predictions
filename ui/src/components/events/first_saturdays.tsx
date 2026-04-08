import type Event from '@/types/event';
import type { PredictionData } from '@/types/prediction';
import PercentagePrediction from './components/percentage-prediction';
import { isPastCutoff } from '@/utils/cutoff';
import useMediaQuery from '@/hooks/use_media_query';
import dayjs from "dayjs";

type FirstSaturdaysProps = {
    events: Event[];
    handlePredictionChange: (id: number, predictionData: PredictionData) => void;
    predictionData?: { [id: number]: PredictionData };
};

const FirstSaturdays = ({ events, handlePredictionChange, predictionData }: FirstSaturdaysProps) => {
    const mediaQuery = useMediaQuery('(min-width: 1024px)');

    return (
        <>
            <div className="mb-5">
                <p className="text-slate-400 flex items-center gap-2">
                    Predict the split of participants between the two factions for First Saturday events in this series.<br />
                    Limited to the range of 40-60%.<br />
                    If both factions hit their threshold for participants (7500 agents), the event will be scored as a draw.
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

export default FirstSaturdays;
