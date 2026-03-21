import { useNavigate } from "react-router";
import { Series } from "../types";
import { Button, Card, CardBody, CardFooter, Image, Skeleton } from "@heroui/react";
import PlaceholderImg from '../assets/placeholder.jpg';

interface Props {
    series: Series;
    skeleton?: boolean;
}

const SeriesCard = ({ series, skeleton }: Props) => {
    const navigate = useNavigate();
    if (skeleton) {
        return (
            <Card className="p-3">
            <CardBody className="overflow-visible py-2">
                <Skeleton className="rounded-lg">
                    <Image
                        alt="Card background"
                        className="object-cover rounded-xl"
                        src={series.image ?? PlaceholderImg}
                    />
                </Skeleton>
            </CardBody>
            <CardFooter className="flex justify-between items-center">
                <div>
                    <Skeleton className="rounded-lg">
                        <h2 className="text-xl font-semibold sm:font-3xl">{series.name} Series</h2>
                    </Skeleton>
                    <Skeleton className="rounded-lg">
                        <p>{series.period}</p>
                    </Skeleton>
                </div>
                <Button onPress={() => navigate(`/predict/${series.id}`)} color="primary" variant="solid">Predict results</Button>
            </CardFooter>
        </Card>
        )
    }
    return (
        <Card className="p-3">
            <CardBody className="overflow-visible py-2">
                <Image
                    alt="Card background"
                    className="object-cover rounded-xl"
                    src={series.image ?? PlaceholderImg}
                />
            </CardBody>
            <CardFooter className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold sm:font-3xl">{series.name} Series</h2>
                    <p>{series.period}</p>
                </div>
                <Button onPress={() => navigate(`/predict/${series.id}`)} color="primary" variant="solid">Predict results</Button>
            </CardFooter>
        </Card>
    )
}

export default SeriesCard;