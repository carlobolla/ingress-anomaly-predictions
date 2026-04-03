import { Link } from "react-router";
import { Navbar } from "../components"

const Scoring = () => {
    return (
        <>
            <Navbar />
            <div className="my-5 container px-3 sm:px-0 mx-auto">
                <h1 className="text-2xl font-semibold mb-1">How Scoring Works</h1>
                <p className="text-foreground/60 mb-8">Everything you need to know to maximise your score</p>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">Four types of events</h2>
                    <div className="space-y-3">
                        <div className="rounded-lg border border-foreground/10 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-semibold">Series Winner</p>
                                    <p className="text-foreground/60 text-sm mt-1">Pick which faction wins the overall series. One prediction per series, scored at the end. No partial credit.</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="font-mono font-semibold">50 pts</p>
                                    <p className="text-foreground/40 text-xs">or 0</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-lg border border-foreground/10 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-semibold">Anomaly</p>
                                    <p className="text-foreground/60 text-sm mt-1">Predict the score split between ENL and RES. The closer your split is to the real result, the more points you earn. Tolerance window: ±20%.</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-success font-mono font-semibold">120 pts</p>
                                    <p className="text-foreground/40 text-xs">max</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-lg border border-foreground/10 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-semibold">Global Challenge / First Saturdays</p>
                                    <p className="text-foreground/60 text-sm mt-1">Same format, but these events tend to finish very close to 50/50. You need to be precise to score well. Tolerance window: ±5%.</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-success font-mono font-semibold">72 pts</p>
                                    <p className="text-foreground/40 text-xs">max</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-lg border border-foreground/10 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-semibold">Minor Event</p>
                                    <p className="text-foreground/60 text-sm mt-1">Just pick the winning faction. No percentages. There are a lot of these per series: don't skip them!</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="font-mono font-semibold">15 pts</p>
                                    <p className="text-foreground/40 text-xs">or 0</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">Anomaly scoring</h2>
                    <p className="text-foreground/70 text-sm mb-2">
                        Your base score scales linearly with accuracy: spot on gives 100 points, and you lose 5 points for every 1% you're off.
                        Miss by 20% or more and you score nothing.
                    </p>
                    <p className="text-foreground/70 text-sm mb-5">
                        Predict the faction with more than 50% and you've implicitly predicted the winner too.
                        If that faction actually won, you get a <span className="text-foreground font-semibold">×1.2 bonus</span> on top.
                        Get the split exactly right and the winner bonus is automatic; there's no way to nail the split without also calling the right winner.
                    </p>

                    <div className="rounded-lg border border-foreground/10 overflow-hidden mb-4">
                        <div className="px-4 py-3 bg-foreground/5 border-b border-foreground/10">
                            <p className="text-sm font-medium">Example - real result: <span className="text-enl-foreground font-mono">ENL 62%</span> - <span className="text-res-foreground font-mono">38% RES</span></p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-foreground/5 text-foreground/60">
                                    <tr>
                                        <th className="text-left px-4 py-2.5 font-medium">Your prediction</th>
                                        <th className="text-right px-4 py-2.5 font-medium">Off by</th>
                                        <th className="text-right px-4 py-2.5 font-medium">Base</th>
                                        <th className="text-right px-4 py-2.5 font-medium">Faction</th>
                                        <th className="text-right px-4 py-2.5 font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-foreground/10">
                                    {[
                                        { pred: "ENL 62%", off: "0%", base: "100", faction: "✓ automatic", total: "120", highlight: true },
                                        { pred: "ENL 57%", off: "5%", base: "75", faction: "✓ ENL wins", total: "90", highlight: false },
                                        { pred: "RES 56%", off: "18%", base: "10", faction: "✗ predicted RES", total: "10", highlight: false },
                                        { pred: "RES 60%", off: "22%", base: "-", faction: "-", total: "0", highlight: false },
                                    ].map((row) => (
                                        <tr key={row.pred} className={row.highlight ? "bg-success/5" : ""}>
                                            <td className="px-4 py-2.5 font-mono">{row.pred}</td>
                                            <td className="px-4 py-2.5 text-right text-foreground/60">{row.off}</td>
                                            <td className="px-4 py-2.5 text-right font-mono text-foreground/60">{row.base}</td>
                                            <td className="px-4 py-2.5 text-right text-foreground/60 text-xs">{row.faction}</td>
                                            <td className={`px-4 py-2.5 text-right font-mono font-semibold ${row.highlight ? "text-success" : ""}`}>{row.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="px-4 py-3 text-xs text-foreground/40 border-t border-foreground/10">
                            RES 56% is within the ±20% window but predicts RES as the winner: the faction bonus is lost even though accuracy still scores.
                        </p>
                    </div>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">Global Challenge scoring</h2>
                    <p className="text-foreground/70 text-sm mb-2">
                        Same principle, but the tolerance window shrinks to ±5% and the base score drops faster: you lose 12 points per 1% deviation.
                        Global Challenges typically end very close to 50/50, which makes the faction call especially dangerous.
                    </p>
                    <p className="text-foreground/70 text-sm mb-5">
                        Being just a few percent off on the wrong side of 50% means you lose the winner bonus entirely, even if your raw accuracy would still score something.
                    </p>

                    <div className="rounded-lg border border-foreground/10 overflow-hidden mb-4">
                        <div className="px-4 py-3 bg-foreground/5 border-b border-foreground/10">
                            <p className="text-sm font-medium">Example - real result: <span className="text-enl-foreground font-mono">ENL 51%</span> - <span className="text-res-foreground font-mono">49% RES</span></p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-foreground/5 text-foreground/60">
                                    <tr>
                                        <th className="text-left px-4 py-2.5 font-medium">Your prediction</th>
                                        <th className="text-right px-4 py-2.5 font-medium">Off by</th>
                                        <th className="text-right px-4 py-2.5 font-medium">Base</th>
                                        <th className="text-right px-4 py-2.5 font-medium">Faction</th>
                                        <th className="text-right px-4 py-2.5 font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-foreground/10">
                                    {[
                                        { pred: "ENL 51%", off: "0%", base: "60", faction: "✓ automatic", total: "72", highlight: true },
                                        { pred: "ENL 53%", off: "2%", base: "36", faction: "✓ ENL wins", total: "43", highlight: false },
                                        { pred: "RES 52%", off: "3%", base: "24", faction: "✗ predicted RES", total: "24", highlight: false },
                                        { pred: "RES 55%", off: "6%", base: "-", faction: "-", total: "0", highlight: false },
                                    ].map((row) => (
                                        <tr key={row.pred} className={row.highlight ? "bg-success/5" : ""}>
                                            <td className="px-4 py-2.5 font-mono">{row.pred}</td>
                                            <td className="px-4 py-2.5 text-right text-foreground/60">{row.off}</td>
                                            <td className="px-4 py-2.5 text-right font-mono text-foreground/60">{row.base}</td>
                                            <td className="px-4 py-2.5 text-right text-foreground/60 text-xs">{row.faction}</td>
                                            <td className={`px-4 py-2.5 text-right font-mono font-semibold ${row.highlight ? "text-success" : ""}`}>{row.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="px-4 py-3 text-xs text-foreground/40 border-t border-foreground/10">
                            RES 52% is only 3% off but predicts RES wins. Missing the faction bonus on a close-to-50/50 result is a common way to leave points on the table.
                        </p>
                    </div>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">What actually moves the leaderboard</h2>
                    <div className="space-y-3">
                        <div className="rounded-lg border border-foreground/10 p-4">
                            <p className="font-semibold mb-1">Anomalies</p>
                            <p className="text-foreground/60 text-sm">Up to 120 points each, with a forgiving ±20% window. A near-miss still scores, and a strong call opens a real gap over the competition.</p>
                        </div>
                        <div className="rounded-lg border border-foreground/10 p-4">
                            <p className="font-semibold mb-1">Global Challenges</p>
                            <p className="text-foreground/60 text-sm">Fewer events, lower ceiling, but the ±5% window punishes vague guesses. Being precise here separates serious players from those who just pick roughly.</p>
                        </div>
                        <div className="rounded-lg border border-foreground/10 p-4">
                            <p className="font-semibold mb-1">Minor Events</p>
                            <p className="text-foreground/60 text-sm">Only 15 points each, but there are many per series. Skipping them is a real disadvantage, even for someone who aces every Anomaly.</p>
                        </div>
                    </div>
                </section>

                <section className="mb-10 space-y-3">
                    <h2 className="text-xl font-semibold mb-3">Tips</h2>
                    <div className="rounded-lg border border-foreground/10 p-4 text-sm text-foreground/70">
                        Double-click any slider to reset it to the centre (50/50 or no faction selected).
                    </div>
                    <div className="rounded-lg border border-foreground/10 p-4 text-sm text-foreground/70">
                        Set your own Faction in the <Link to="/profile" className="text-blue-500 hover:underline">Profile</Link> page. This doesn't affect your predictions, but it does add a coloured badge next to your name on the leaderboard.
                    </div>
                </section>
            </div>
        </>
    )
}

export default Scoring;
