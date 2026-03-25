import { Card } from '@heroui/react';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import SingleSite from './single-site';
import { Event, PredictionData, Region } from '../../types';
import { LockClosedIcon } from '@heroicons/react/24/solid';

dayjs.extend(LocalizedFormat);

interface Props {
    region: Region;
    events: Event[];
    onPredictionChange: (id: number, predictionData: PredictionData) => void;
    predictions: { [id: number]: PredictionData };
    subtext?: string;
    readonly: (event: Event) => boolean;
}

const RegionList = ({ region, events, onPredictionChange, predictions, subtext, readonly }: Props) => {
    return (
        <Card>
            <Card.Header>
                <div className="flex flex-col">
                    <div className="flex flex-row justify-between">
                        <p className="text-lg font-semibold">{region} Region</p>
                        {events.every(e => readonly(e)) && <LockClosedIcon className="size-6" />}
                    </div>
                    <p className="text-slate-400">
                        {subtext}
                    </p>
                </div>
            </Card.Header>
            <Card.Content className="flex gap-3">
                {events.map((event, index) => (
                    <SingleSite
                        key={event.id}
                        event={event}
                        last={index === events.length - 1}
                        onPredictionChange={onPredictionChange}
                        predictionData={predictions[event.id]}
                        readonly={readonly}
                    />
                ))}
            </Card.Content>
        </Card>
    );
};

export default RegionList;
