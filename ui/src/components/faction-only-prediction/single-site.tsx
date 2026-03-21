import { cn, Divider, Slider, Tooltip } from '@heroui/react';
import { useState, useEffect, useMemo } from 'react';
import { Event, PredictionData } from '../../types';
import { LockClosedIcon } from '@heroicons/react/16/solid';
import useMediaQuery from '../../hooks/use_media_query';
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

    return (
        <div className="flex flex-col gap-3">
            <Tooltip content="Prediction cutoff date has passed." showArrow isDisabled={!isReadonly}>
                <>
                    <div className={"flex justify-between " + (isReadonly && " cursor-not-allowed")}>
                        <div className='flex truncate items-center'>
                            {isReadonly && <LockClosedIcon className="flex-shrink size-4 me-2" />}
                            <p className={"text-left text-semibold truncate" + (isReadonly && " text-slate-400")}>{event.name}</p>
                        </div>
                        <div className="flex flex-row gap-3">
                            <p className={"text-success transition-opacity " + (sliderDisplayValue >= 50 && 'opacity-25')}>
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
                                classNames={{
                                    filler: cn('bg-primary'), 
                                    track: cn('bg-success', 'border-s-primary'), thumb: faction === 50 ? cn('bg-foreground') :
                                    faction > 50 ? cn('bg-primary') :
                                    cn('bg-success')
                                }}
                            />
                            <p className={"text-primary transition-opacity " + (sliderDisplayValue <= 50 && 'opacity-25')}>
                                RES
                            </p>
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm">
                        {`${dayjs(event.start_time).format('MMMM Do, YYYY @ HH:mm')}${showEndDate ? ` -> ${dayjs(event.end_time).format('MMMM Do, YYYY @ HH:mm')}` : ''}`}
                    </p>
                </>
            </Tooltip>
            {!last && <Divider />}
        </div>
    );
};

export default SingleSite;