export interface PredictionData {
    winner?: string | null,
    enl_score?: number,
    res_score?: number,
    score?: number | null,
}

export interface Prediction {
    id: number,
    event: number,
    winner: string,
    enl_score: number,
    res_score: number,
    score?: number | null,
    created_at: Date,
    updated_at: Date,
    user: string
}