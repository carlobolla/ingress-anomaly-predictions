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
    globalchallenge = 1,
    anomaly,
    skirmish,
}

export enum EventTypeString {
    "Global Challenge" = 1,
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