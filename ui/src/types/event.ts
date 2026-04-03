interface Event {
    id: number,
    name: string,
    start_time: Date,
    end_time: Date,
    cutoff_time: Date,
    type: number,
    series: number,
    region: Region,
    enl_score?: number | null,
    res_score?: number | null,
    actual_winner?: string | null,
}

export interface EventType {
    id: number;
    name: string;
    scoring_mode: number;
    order: number;
    cutoff_interval: string;
}

export enum Region {
    APAC = 'APAC',
    EMEA = 'EMEA',
    AMER = 'AMER',
    Global = 'Global'
}

export default Event;