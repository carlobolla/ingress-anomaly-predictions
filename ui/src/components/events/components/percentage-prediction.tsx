import { LockClosedIcon } from '@heroicons/react/24/solid';
import { Card, Slider } from '@heroui/react';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat'
import { useEffect, useMemo, useState } from 'react';
import { Event, PredictionData } from '../../../types';

dayjs.extend(LocalizedFormat);
dayjs.extend(advancedFormat);

interface Props {
    event: Event;
    onPredictionChange: (id: number, predictionData: PredictionData) => void;
    readonly: (event: Event) => boolean;
    prediction?: PredictionData;
    showEndTime?: boolean;
    range?: [number, number];
}

const PercentagePrediction = ({ event, onPredictionChange, readonly, prediction, showEndTime, range }: Props) => {
    const [sliderDisplayValue, setSliderDisplayValue] = useState<number>(prediction?.enl_score ?? 50);
    const [sliderPredictionValue, setSliderPredictionValue] = useState<number>(prediction?.enl_score ?? 50);
    const isReadonly = useMemo(() => readonly(event), [readonly, event]);

    useEffect(() => {
        const faction = sliderPredictionValue === 50 ? null : sliderPredictionValue < 50 ? 'RES' : 'ENL';
        const res_score = 100 - sliderPredictionValue;
        onPredictionChange(event.id, { winner: faction, enl_score: sliderPredictionValue, res_score });
    }, [onPredictionChange, event.id, sliderPredictionValue]);

    const thumbClass = sliderDisplayValue === 50 ? 'bg-foreground' : sliderDisplayValue > 50 ? 'bg-res' : 'bg-enl';

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
            <Card.Content>
                <div className="flex flex-row justify-between gap-3">
                    <p className={"text-enl transition-opacity " + (sliderDisplayValue <= 50 && 'opacity-25')}><span className="sm:hidden">ENL</span><span className="hidden sm:inline">Enlightened</span></p>
                    <p className='w-[6em] text-center'>{sliderDisplayValue}%</p>
                    <Slider
                        isDisabled={isReadonly}
                        aria-label={`${event.name} Anomaly Enlightened percentage score`}
                        minValue={range ? range[0] : 0}
                        maxValue={range ? range[1] : 100}
                        value={sliderDisplayValue}
                        onChange={(value) => setSliderDisplayValue(Array.isArray(value) ? value[0] : value)}
                        onChangeEnd={(value) => setSliderPredictionValue(Array.isArray(value) ? value[0] : value)}
                        onDoubleClick={() => { setSliderPredictionValue(50); setSliderDisplayValue(50); }}
                    >
                        <Slider.Track className="bg-res !border-s-enl">
                            <Slider.Fill className="bg-enl" />
                            <Slider.Thumb className={thumbClass} />
                        </Slider.Track>
                    </Slider>
                    <p className='w-[6em] text-center'>{100 - sliderDisplayValue}%</p>
                    <p className={"text-res transition-opacity " + (sliderDisplayValue >= 50 && 'opacity-25')}><span className="sm:hidden">RES</span><span className="hidden sm:inline">Resistance</span></p>
                </div>
                <p className="text-slate-400 text-sm mt-3">
                    {`${dayjs(event.start_time).format('MMMM Do, YYYY @ HH:mm')}${showEndTime ? ` -> ${dayjs(event.end_time).format('MMMM Do, YYYY @ HH:mm')}` : ''}`}
                </p>
            </Card.Content>
        </Card>
    );
};

export default PercentagePrediction;
