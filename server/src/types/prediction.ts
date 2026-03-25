export enum Winner{
    ENL,
    RES
}

export default interface Prediction {
    id: number;
    event_id: number;
    winner: Winner;
    enl_score: number;
    res_score: number;
    created_at: Date;
    updated_at: Date;
    user: number;
    score: number;
}

export interface PredictionInput {
    winner?: Winner;
    enl_score: number;
    res_score: number;
}