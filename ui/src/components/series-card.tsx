import { useNavigate } from "react-router";
import type Series from '@/types/series';
import { Button, Card, Skeleton } from "@heroui/react";
import PlaceholderImg from '@/assets/placeholder.jpg';
import useAuth from '@/hooks/use_auth';

interface Props {
    series: Series;
    skeleton?: boolean;
}

const SeriesCard = ({ series, skeleton }: Props) => {
    const navigate = useNavigate();
    const {isAuthenticated} = useAuth();
    if (skeleton) {
        return (
            <Card className="p-3">
                <Card.Content className="overflow-visible py-2">
                    <Skeleton className="rounded-lg w-full h-48" />
                </Card.Content>
                <Card.Footer className="flex justify-between items-center">
                    <div>
                        <Skeleton className="rounded-lg h-7 w-40 mb-1" />
                        <Skeleton className="rounded-lg h-5 w-24" />
                    </div>
                    <Skeleton className="rounded-lg h-10 w-32" />
                </Card.Footer>
            </Card>
        )
    }
    return (
        <Card>
            <Card.Header className="overflow-visible">
                <img
                    alt="Card background"
                    className="object-cover rounded-xl w-full"
                    src={series.image ?? PlaceholderImg}
                />
            </Card.Header>
            <Card.Content className="flex flex-row justify-between items-center">
                <div>
                    <h2 className="font-semibold sm:text-lg">{series.name} Series</h2>
                    <p className="text-sm">{series.period}</p>
                </div>
                <div>
                    {isAuthenticated ? (
                        <Button onPress={() => navigate(`/predict/${series.id}`)} variant="primary">
                            Predict results
                        </Button>
                    ) : (
                        <p className="text-muted text-sm">Sign in to predict</p>
                    )}
                </div>
            </Card.Content>
        </Card>
    )
}

export default SeriesCard;
