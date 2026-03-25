import { Separator, Slider, Tooltip } from '@heroui/react';
import { useState, useEffect, useMemo } from 'react';
import { Event, PredictionData } from '../../types';
import { LockClosedIcon } from '@heroicons/react/16/solid';
import dayjs from 'dayjs';

interface Props {
    event: Event;
    last: boolean;
    onPredictionChange: (id: number, predictionData: PredictionData) => void;
    predictionData: PredictionData;
    readonly: (event: Event) => boolean;
    showEndDate?: boolean;
}

const SingleSite = ({ event, last, onPredictionChange, predictionData, readonly, showEndDate }: Props) => {
    const [faction, setFaction] = useState<number>(predictionData?.winner === 'RES' ? 100 : predictionData?.winner === 'ENL' ? 0 : 50);
    const [sliderDisplayValue, setSliderDisplayValue] = useState<number>(predictionData?.winner === 'RES' ? 100 : predictionData?.winner === 'ENL' ? 0 : 50);
    const isReadonly = useMemo(() => readonly(event), [readonly, event]);

    useEffect(() => {
        onPredictionChange(event.id, { winner: faction === 50 ? 'DRAW' : faction === 0 ? 'ENL' : 'RES' });
    }, [faction, onPredictionChange, event.id]);

    const thumbClass = faction === 50 ? 'bg-foreground' : faction > 50 ? 'bg-res' : 'bg-enl';

    return (
        <div className="flex flex-col gap-3">
            <Tooltip isDisabled={!isReadonly}>
                <Tooltip.Trigger>
                    <div>
                        <div className={"flex justify-between " + (isReadonly && " cursor-not-allowed")}>
                            <div className='flex truncate items-center'>
                                {isReadonly && <LockClosedIcon className="flex-shrink size-4 me-2" />}
                                <p className={"text-left text-semibold truncate" + (isReadonly && " text-slate-400")}>{event.name}</p>
                            </div>
                            <div className="flex flex-row gap-3">
                                <p className={"text-enl transition-opacity " + (sliderDisplayValue >= 50 && 'opacity-25')}>
                                    ENL
                                </p>
                                <Slider
                                    className='w-[80px]'
                                    isDisabled={isReadonly}
                                    defaultValue={sliderDisplayValue}
                                    aria-label={`${event.name} faction prediction`}
                                    step={50}
                                    minValue={0}
                                    maxValue={100}
                                    onChange={(value) => setSliderDisplayValue(Array.isArray(value) ? value[0] : value)}
                                    onChangeEnd={(value) => setFaction(Array.isArray(value) ? value[0] : value)}
                                    onDoubleClick={() => { setFaction(50); setSliderDisplayValue(50); }}
                                >
                                    <Slider.Track className="bg-enl border-s-res">
                                        <Slider.Fill className="bg-res" />
                                        <Slider.Thumb className={thumbClass} />
                                    </Slider.Track>
                                </Slider>
                                <p className={"text-res transition-opacity " + (sliderDisplayValue <= 50 && 'opacity-25')}>
                                    RES
                                </p>
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm">
                            {`${dayjs(event.start_time).format('MMMM Do, YYYY @ HH:mm')}${showEndDate ? ` -> ${dayjs(event.end_time).format('MMMM Do, YYYY @ HH:mm')}` : ''}`}
                        </p>
                    </div>
                </Tooltip.Trigger>
                <Tooltip.Content showArrow>
                    <Tooltip.Arrow />
                    <p>Prediction cutoff date has passed.</p>
                </Tooltip.Content>
            </Tooltip>
            {!last && <Separator />}
        </div>
    );
};

export default SingleSite;
