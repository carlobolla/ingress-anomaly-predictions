import { LockClosedIcon } from '@heroicons/react/24/solid';
import { Card, CardBody, CardHeader, cn, Slider, Tooltip } from '@heroui/react';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat'
import { useEffect, useMemo, useState } from 'react';
import { Event, PredictionData } from '../../types';

dayjs.extend(LocalizedFormat);
dayjs.extend(advancedFormat);

interface Props {
    event: Event;
    onPredictionChange: (id: number, predictionData: PredictionData) => void;
    readonly: (event: Event) => boolean;
    prediction?: PredictionData;
    showEndTime?: boolean;
}

const PercentagePrediction = ({ event, onPredictionChange, readonly, prediction, showEndTime: showEndTime }: Props) => {
    const [sliderDisplayValue, setSliderDisplayValue] = useState<number>(prediction?.enl_score ?? 50);
    const [sliderPredictionValue, setSliderPredictionValue] = useState<number>(prediction?.enl_score ?? 50);
    const isReadonly = useMemo(() => readonly(event), [readonly, event]);

    useEffect(() => {
        const faction = sliderPredictionValue === 50 ? 'DRAW' : sliderPredictionValue < 50 ? 'RES' : 'ENL';
        const res_score = 100 - sliderPredictionValue;
        onPredictionChange(event.id, { winner: faction, enl_score: sliderPredictionValue, res_score });
    }, [onPredictionChange, event.id, sliderPredictionValue]);

    return (
            <Tooltip content="Prediction cutoff date has passed." showArrow isDisabled={!isReadonly}>
            <Card>
                <CardHeader>
                    <div className="flex flex-col">
                        <div className="flex flex-row justify-between">
                            <p className="text-lg font-semibold">{event.name}</p>
                            {isReadonly && <LockClosedIcon className="size-6" />}
                        </div>
                        <p className="text-slate-400">
                            A cancellation will result in no points for your prediction.
                            Cutoff date for predictions is 24 hours before the event starts.
                        </p>
                    </div>
                </CardHeader>
                <CardBody>
                    <div className="flex flex-row justify-between gap-3">
                        <p className={"text-success transition-opacity " + (sliderDisplayValue <= 50 && 'opacity-25')}>Enlightened</p>
                        <p className='w-[6em] text-center'>{sliderDisplayValue}%</p>
                        <Slider
                            isDisabled={isReadonly}
                            aria-label={`${event.name} Anomaly Enlightened percentage score`}
                            minValue={0}
                            maxValue={100}
                            value={sliderDisplayValue}
                            onChange={(value) => setSliderDisplayValue(Array.isArray(value) ? value[0] : value)}
                            onChangeEnd={(value) => setSliderPredictionValue(Array.isArray(value) ? value[0] : value)}
                            onDoubleClick={() => { setSliderPredictionValue(50); setSliderDisplayValue(50); }}
                            classNames={{
                                track: cn('bg-primary', '!border-s-success'), filler: cn('bg-success'), thumb: sliderDisplayValue === 50 ? cn('bg-foreground') :
                                sliderDisplayValue > 50 ? cn('bg-success') :
                                cn('bg-primary')
                            }}
                        />
                        <p className='w-[6em] text-center'>{100 - sliderDisplayValue}%</p>
                        <p className={"text-primary transition-opacity " + (sliderDisplayValue >= 50 && 'opacity-25')}>Resistance</p>
                    </div>
                    <p className="text-slate-400 text-sm mt-3">
                        {`${dayjs(event.start_time).format('MMMM Do, YYYY @ HH:mm')}${showEndTime ? ` -> ${dayjs(event.end_time).format('MMMM Do, YYYY @ HH:mm')}` : ''}`}
                    </p>
                </CardBody>
            </Card>
        </Tooltip>
    );
};

export default PercentagePrediction;