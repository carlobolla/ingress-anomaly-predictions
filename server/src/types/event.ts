export interface EventRow {
    id: number;
    name: string;
    type: number;
    enl_score: number | null;
    res_score: number | null;
    winner: string | null;
}
