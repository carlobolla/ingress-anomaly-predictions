import dayjs from 'dayjs';
import { Event } from '../types';

export const isPastCutoff = (event: Event): boolean => {
    return dayjs(event.cutoff_time).isBefore(dayjs());
};
