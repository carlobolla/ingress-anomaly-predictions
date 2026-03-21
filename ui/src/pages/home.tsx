import { Link } from "@heroui/react"
import { Navbar, SeriesCard } from "../components"
import { useEffect, useState } from "react"
import { Series } from "../types"
import api from "../api/axios"

const Home = () => {
    const [series, setSeries] = useState([])
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        api.get('/series')
            .then(async res => {
                setSeries(res.data)
                setLoading(false)
            })
    }, [])
    return (
        <>
            <Navbar />
            <div className="my-5 container px-3 sm:px-0 mx-auto">
                <h1 className="text-2xl font-semibold sm:font-4xl">Ingress Anomaly Series Predictions</h1>
                <p>powered by <Link href="https://t.me/IUENG">@IUENG</Link></p>
                <div className='mt-5 grid grid-cols-1 lg:grid-cols-3 gap-3'>
                    {loading && <SeriesCard skeleton series={{id: 1, name: 'Loading...', image: '', period: ''}} />}
                    {!loading && series.length === 0 && <h2 className="text-xl font-semibold sm:font-3xl">No series available to predict. Check back later!</h2>}
                    {series.map((series: Series) => <SeriesCard key={series.id} series={series} />)}
                </div>
            </div>
        </>
    )
}

export default Home;