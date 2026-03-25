export interface PredictionData {
    winner?: string,
    enl_score?: number,
    res_score?: number,
}

export interface Prediction {
    id: number,
    event: number,
    winner: string,
    enl_score: number,
    res_score: number,
    created_at: Date,
    updated_at: Date,
    user: string
}