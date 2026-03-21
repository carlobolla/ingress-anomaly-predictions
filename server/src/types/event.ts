import { Winner } from "./prediction";

export enum EventType {
    anomaly = 1,
    globalchallenge,
    skirmish,
}

export enum Region {
    AMER = 1,
    EMEA,
    APAC,
    GLOBAL
}

export default interface Event{
    id: number;
    name: string;
    start_time: Date;
    end_time: Date;
    type: EventType;
    series: number;
    winner: Winner;
    enl_score: number;
    res_score: number;
    region: Region;
    enl_raw_score: number;
    res_raw_score: number;
}


