export enum Winner {
    ENL = 'ENL',
    RES = 'RES',
}

export default interface Prediction {
    id: number;
    event_id: number;
    winner?: Winner | null;
    enl_score: number;
    res_score: number;
    created_at: Date;
    updated_at: Date;
    user: number;
    score: number;
}

export interface PredictionInput {
    winner?: Winner | null;
    enl_score: number;
    res_score: number;
}