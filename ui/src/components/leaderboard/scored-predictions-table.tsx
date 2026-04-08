import { ScoredPrediction } from "./leaderboard-helpers";

const formatPrediction = (p: ScoredPrediction) => {
    if (p.predicted_enl_score != null && p.predicted_res_score != null) {
        return `ENL ${p.predicted_enl_score}% - ${p.predicted_res_score}% RES`;
    }
    return p.predicted_winner ?? "-";
};

const formatActual = (p: ScoredPrediction) => {
    if (p.actual_enl_score != null && p.actual_res_score != null) {
        return `ENL ${p.actual_enl_score}% - ${p.actual_res_score}% RES`;
    }
    return p.actual_winner ?? "TBD";
};

interface Props {
    predictions: ScoredPrediction[];
}

const ScoredPredictionsTable = ({ predictions }: Props) => {
    if (predictions.length === 0) return null;

    return (
        <div className="rounded-lg border border-foreground/10 overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-foreground/10 text-foreground/50 text-xs">
                        <th className="text-left px-4 py-2 font-medium">Event</th>
                        <th className="text-left px-4 py-2 font-medium">Predicted</th>
                        <th className="text-left px-4 py-2 font-medium">Actual</th>
                        <th className="text-right px-4 py-2 font-medium">Points</th>
                    </tr>
                </thead>
                <tbody>
                    {predictions.map((p) => (
                        <tr key={p.id} className="border-b border-foreground/5 last:border-0">
                            <td className="px-4 py-2 font-medium truncate max-w-[180px]">{p.event_name}</td>
                            <td className="px-4 py-2 text-foreground/70 font-mono text-xs">{formatPrediction(p)}</td>
                            <td className="px-4 py-2 text-foreground/70 font-mono text-xs">{formatActual(p)}</td>
                            <td className="px-4 py-2 text-right font-mono font-semibold">
                                {p.score != null ? `${p.score} pts` : "-"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ScoredPredictionsTable;
