import Navbar from '@/components/navbar/navbar';
import { Link } from "react-router";

const Admin = () => {
    return (
        <>
            <Navbar />
            <div className="my-5 container px-3 sm:px-0 mx-auto">
                <h1 className="text-2xl font-semibold sm:font-4xl">Ingress Anomaly Series Predictions</h1>
                <p>powered by <Link to="https://t.me/IUENG">@IUENG</Link></p>
            </div>
        </>
    )
}

export default Admin;