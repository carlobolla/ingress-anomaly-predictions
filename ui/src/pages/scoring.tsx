import { Navbar } from "../components"

const Scoring = () => {
    return (
        <>
            <Navbar />
            <div className="my-5 container px-3 sm:px-0 mx-auto">
                <h1 className="text-2xl font-semibold mb-1">How Scoring Works</h1>
                <p className="text-foreground/60 mb-8">Everything you need to know to maximise your score</p>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">Three types of events</h2>
                    <p className="text-foreground/70 text-sm mb-4">
                        Not all predictions are equal. Anomalies are the hardest to call accurately and worth the most.
                        Minor events are simple but frequent, so they add up.
                    </p>
                    <div className="space-y-3">
                        <div className="rounded-lg border border-foreground/10 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-semibold">Anomaly</p>
                                    <p className="text-foreground/60 text-sm mt-1">Predict the faction score split (e.g. "ENL 58% - RES 42%") and which side wins. The closer your split is to reality, the more points you earn.</p>
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
                                    <p className="font-semibold">Global Challenge</p>
                                    <p className="text-foreground/60 text-sm mt-1">Same format as an Anomaly: percentage split plus faction winner. These tend to finish very close to 50/50, so you need to be precise to score well.</p>
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
                                    <p className="text-foreground/60 text-sm mt-1">Just pick the winning faction. No percentages: it's a straightforward call. There are a lot of these per series, so don't skip them.</p>
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
                    <h2 className="text-xl font-semibold mb-3">How percentage predictions are scored</h2>
                    <p className="text-foreground/70 text-sm mb-4">
                        For Anomalies and Global Challenges, you predict what percentage each faction scores.
                        You start with full points for a perfect guess and lose points as your guess drifts further from the real result.
                        Go too far off and you score nothing.
                    </p>

                    <div className="space-y-6">
                        {/* Anomaly */}
                        <div>
                            <p className="font-semibold mb-1">Anomaly - tolerance window: ±20%</p>
                            <p className="text-foreground/60 text-sm mb-3">
                                You have more room to be wrong here. Being off by 10% still gets you half the points.
                            </p>
                            <div className="overflow-x-auto rounded-lg border border-foreground/10">
                                <table className="w-full text-sm">
                                    <thead className="bg-foreground/5 text-foreground/60">
                                        <tr>
                                            <th className="text-left px-4 py-2.5 font-medium">How far off your guess was</th>
                                            <th className="text-right px-4 py-2.5 font-medium">Points</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-foreground/10">
                                        {[
                                            { dev: "Spot on", pts: "100" },
                                            { dev: "5% off", pts: "75" },
                                            { dev: "10% off", pts: "50" },
                                            { dev: "15% off", pts: "25" },
                                            { dev: "20% off or more", pts: "0" },
                                        ].map((row) => (
                                            <tr key={row.dev}>
                                                <td className="px-4 py-2.5">{row.dev}</td>
                                                <td className="px-4 py-2.5 text-right font-mono text-foreground/60">{row.pts}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <p className="font-semibold mb-1">Global Challenge - tolerance window: ±5%</p>
                            <p className="text-foreground/60 text-sm mb-3">
                                Much tighter. A 3% miss already costs you more than half your points, so vague guesses won't score.
                            </p>
                            <div className="overflow-x-auto rounded-lg border border-foreground/10">
                                <table className="w-full text-sm">
                                    <thead className="bg-foreground/5 text-foreground/60">
                                        <tr>
                                            <th className="text-left px-4 py-2.5 font-medium">How far off your guess was</th>
                                            <th className="text-right px-4 py-2.5 font-medium">Points</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-foreground/10">
                                        {[
                                            { dev: "Spot on", pts: "60" },
                                            { dev: "1% off", pts: "48" },
                                            { dev: "2.5% off", pts: "30" },
                                            { dev: "4% off", pts: "12" },
                                            { dev: "5% off or more", pts: "0" },
                                        ].map((row) => (
                                            <tr key={row.dev}>
                                                <td className="px-4 py-2.5">{row.dev}</td>
                                                <td className="px-4 py-2.5 text-right font-mono text-foreground/60">{row.pts}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">The faction winner bonus</h2>
                    <p className="text-foreground/70 text-sm mb-3">
                        Getting the winning faction right earns you a <span className="text-foreground font-semibold">+20% bonus</span> on top of whatever your percentage accuracy scored.
                        This is extra reward, not a penalty: if you called the wrong winner but your percentage was accurate, you still keep those points.
                    </p>
                    <p className="text-foreground/70 text-sm">
                        One catch: if your percentage is too far off (outside the tolerance window), you score zero no matter what, even if you called the right winner.
                        Accuracy comes first.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">What actually moves the leaderboard</h2>
                    <p className="text-foreground/70 text-sm mb-3">
                        Anomalies carry the most weight per event by far with up to 120 points each, with a wide enough tolerance window that a near-miss still scores something.
                        They're the events where a strong prediction can open a big gap over the competition.
                    </p>
                    <p className="text-foreground/70 text-sm mb-3">
                        Global Challenges are fewer and worth less, but the tight ±5% window makes them a real skill test.
                        A precise call here can quietly separate you from players who just guess roughly.
                    </p>
                    <p className="text-foreground/70 text-sm">
                        Minor events are only 15 points each, but there are a lot of them.
                        Consistently picking them up across a series adds up to a meaningful chunk of your total, enough that ignoring them is a real disadvantage, even for players who ace every Anomaly.
                    </p>
                </section>


            </div>
        </>
    )
}

export default Scoring;
