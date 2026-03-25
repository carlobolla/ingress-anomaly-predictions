import dayjs from 'dayjs';
import { Event, EventType } from '../types';

export const isPastCutoff = (event: Event): boolean => {
    switch (event.type) {
        case EventType.globalchallenge:
            return dayjs(event.end_time).subtract(15, 'days') < dayjs();
        default:
            return dayjs(event.start_time).subtract(24, 'hours') < dayjs();
    }
};
