import dayjs from 'dayjs';
import type Event from '@/types/event';

export const isPastCutoff = (event: Event): boolean => {
    return dayjs(event.cutoff_time).isBefore(dayjs());
};
