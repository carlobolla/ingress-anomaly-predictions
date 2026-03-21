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
    anomaly = 1,
    globalchallenge,
    skirmish,
}

export enum EventTypeString {
    "Anomaly" = 1,
    "Global Challenge",
    "Skirmish",
}

export enum Region {
    APAC = 'APAC',
    EMEA = 'EMEA',
    AMER = 'AMER',
    Global = 'Global'
}

export default Event;