import { LockClosedIcon } from '@heroicons/react/24/solid';
import { Card, Slider } from '@heroui/react';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat'
import { useEffect, useMemo, useState } from 'react';
import type Event from '@/types/event';
import type { PredictionData } from '@/types/prediction';

dayjs.extend(LocalizedFormat);
dayjs.extend(advancedFormat);

interface Props {
    event: Event;
    onPredictionChange: (id: number, predictionData: PredictionData) => void;
    readonly: (event: Event) => boolean;
    prediction?: PredictionData;
    showEndTime?: boolean;
    range?: [number, number];
    actualScore?: number | null;
}

const PercentagePrediction = ({ event, onPredictionChange, readonly, prediction, showEndTime, range, actualScore }: Props) => {
    const [sliderDisplayValue, setSliderDisplayValue] = useState<number>(prediction?.enl_score ?? 50);
    const [sliderPredictionValue, setSliderPredictionValue] = useState<number>(prediction?.enl_score ?? 50);
    const isReadonly = useMemo(() => readonly(event), [readonly, event]);

    useEffect(() => {
        const faction = sliderPredictionValue === 50 ? null : sliderPredictionValue < 50 ? 'RES' : 'ENL';
        const res_score = 100 - sliderPredictionValue;
        onPredictionChange(event.id, { winner: faction, enl_score: sliderPredictionValue, res_score });
    }, [onPredictionChange, event.id, sliderPredictionValue]);

    const thumbClass = sliderDisplayValue === 50 ? 'bg-foreground' : sliderDisplayValue > 50 ? 'bg-res' : 'bg-enl';
    const min = range ? range[0] : 0;
    const max = range ? range[1] : 100;
    const actualMarkerPct = actualScore != null ? ((actualScore - min) / (max - min)) * 100 : null;

    return (
        <Card className={isReadonly ? "cursor-not-allowed" : ""}>
            <Card.Header>
                <div className="flex flex-col justify-between sm:flex-row">
                    <p className="text-lg font-semibold">{event.name}</p>
                    {isReadonly && (
                        <div tabIndex={0} className="flex items-center gap-2 mt-1 text-slate-400">
                            <LockClosedIcon className='size-4'/> Prediction cutoff date has passed.
                        </div>
                    )}
                </div>
            </Card.Header>
            <Card.Content className="justify-between">
                <div className="flex flex-row justify-between gap-3 items-center">
                    <p className={"text-enl transition-opacity " + (sliderDisplayValue <= 50 && 'opacity-25')}><span className="sm:hidden">ENL</span><span className="hidden sm:inline">Enlightened</span></p>
                    <p className='w-[6em] text-center'>{sliderDisplayValue}%</p>
                    <Slider
                        className="overflow-visible"
                        isDisabled={isReadonly}
                        aria-label={`${event.name} Anomaly Enlightened percentage score`}
                        minValue={range ? range[0] : 0}
                        maxValue={range ? range[1] : 100}
                        value={sliderDisplayValue}
                        onChange={(value) => setSliderDisplayValue(Array.isArray(value) ? value[0] : value)}
                        onChangeEnd={(value) => setSliderPredictionValue(Array.isArray(value) ? value[0] : value)}
                        onDoubleClick={() => { setSliderPredictionValue(50); setSliderDisplayValue(50); }}
                    >
                        <Slider.Track className="bg-res !border-s-enl overflow-visible">
                            <Slider.Fill className="bg-enl" />
                            <Slider.Thumb className={thumbClass} />
                            {actualMarkerPct != null && (
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-400 rounded-full pointer-events-none"
                                    style={{ left: `${actualMarkerPct}%` }}
                                />
                            )}
                        </Slider.Track>
                    </Slider>
                    <p className='w-[6em] text-center'>{100 - sliderDisplayValue}%</p>
                    <p className={"text-res transition-opacity " + (sliderDisplayValue >= 50 && 'opacity-25')}><span className="sm:hidden">RES</span><span className="hidden sm:inline">Resistance</span></p>
                </div>
                
                {actualScore != null && (
                    <p className="text-sm mt-3 font-mono flex items-center justify-between">
                        <span>Result: <span className="text-enl">{actualScore}% ENL</span> / <span className="text-res">RES {100 - actualScore}%</span></span>
                        {prediction?.score != null && <span className="font-semibold">{prediction.score} pts</span>}
                    </p>
                )}
                <p className="text-slate-400 text-sm mt-3">
                    {`${dayjs(event.start_time).format('MMMM Do, YYYY @ HH:mm')}${showEndTime ? ` -> ${dayjs(event.end_time).format('MMMM Do, YYYY @ HH:mm')}` : ''}`}
                </p>
            </Card.Content>
        </Card>
    );
};

export default PercentagePrediction;
