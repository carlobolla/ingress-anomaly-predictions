interface Event {
    id: number,
    name: string,
    start_time: Date,
    end_time: Date,
    type: EventType,
    series: number,
    region: Region
}

export enum EventType {
    series,
    globalchallenge,
    anomaly,
    skirmish,
}

export enum EventTypeString {
    "Series Winner",
    "Global Challenge",
    "Anomaly",
    "Skirmish",
}

export enum Region {
    APAC = 'APAC',
    EMEA = 'EMEA',
    AMER = 'AMER',
    Global = 'Global'
}

export default Event;