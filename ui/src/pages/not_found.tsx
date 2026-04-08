import Navbar from '@/components/navbar/navbar';

const NotFound = () => {
    return (
        <>
            <Navbar />
            <div className="my-5 container px-3 sm:px-0 mx-auto">
                <h1 className="text-2xl font-semibold sm:font-4xl">404 - Not Found</h1>
                <p>The page you are looking for does not exist.</p>
            </div>
        </>
    )
}

export default NotFound;