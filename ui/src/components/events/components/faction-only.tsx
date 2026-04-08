import dayjs from "dayjs";
import type Event from '@/types/event';
import type { PredictionData } from '@/types/prediction';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat'
import { useState, useMemo, useEffect } from "react";
import { Card, Slider } from "@heroui/react";
import { LockClosedIcon } from "@heroicons/react/24/solid";

dayjs.extend(LocalizedFormat);
dayjs.extend(advancedFormat);

interface Props {
    event: Event;
    onPredictionChange: (id: number, predictionData: PredictionData) => void;
    readonly: (event: Event) => boolean;
    prediction?: PredictionData;
    showEndTime?: boolean;
}

const PredictionFactionOnly = ({ event, onPredictionChange, readonly, prediction, showEndTime }: Props) => {
    const [faction, setFaction] = useState<number>(prediction?.winner === 'RES' ? 100 : prediction?.winner === 'ENL' ? 0 : 50);
    const [sliderDisplayValue, setSliderDisplayValue] = useState<number>(prediction?.winner === 'RES' ? 100 : prediction?.winner === 'ENL' ? 0 : 50);
    const isReadonly = useMemo(() => readonly(event), [readonly, event]);

    useEffect(() => {

        onPredictionChange(event.id, { winner: faction === 50 ? null : faction === 0 ? 'ENL' : 'RES'});
    }, [faction, onPredictionChange, event.id]);

    const thumbClass = faction === 50 ? 'bg-foreground' : faction > 50 ? 'bg-res' : 'bg-enl';

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
                <div className="flex flex-row justify-start gap-3">
                    <p className={"text-enl transition-opacity " + (sliderDisplayValue >= 50 && 'opacity-25')}><span className="sm:hidden">ENL</span><span className="hidden sm:inline">Enlightened</span></p>
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
                        <Slider.Track className="bg-enl !border-s-res">
                            <Slider.Fill className="bg-res" />
                            <Slider.Thumb className={thumbClass} />
                        </Slider.Track>
                    </Slider>
                    <p className={"text-res transition-opacity " + (sliderDisplayValue <= 50 && 'opacity-25')}><span className="sm:hidden">RES</span><span className="hidden sm:inline">Resistance</span></p>
                </div>
                <p className="text-slate-400 text-sm mt-3">
                    {`${dayjs(event.start_time).format('MMMM Do, YYYY @ HH:mm')}${showEndTime ? ` -> ${dayjs(event.end_time).format('MMMM Do, YYYY @ HH:mm')}` : ''}`}
                </p>
            </Card.Content>
        </Card>
    );
}

export default PredictionFactionOnly;
