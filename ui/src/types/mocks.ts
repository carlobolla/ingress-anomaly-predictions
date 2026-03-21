import Event, { EventType, Region } from "./event"
import PlaceholderImg from '../assets/placeholder.jpg'

export const getMockAnomaly = (): Event => {
    return {
        id: 1,
        name: 'mockCity, mockCountry',
        start_date: new Date(),
        end_date: new Date(),
        type: EventType.anomaly,
        series: 1,
        region: Region.AMER
    }
}

export const getMockSkirmishes = (): Event[] => {
    return Array.from({length: 12}, (_v, i) => i).map((i) => {
        return {
            id: i,
            name: `mockCity, mockCountry`,
            start_date: new Date(),
            end_date: new Date(),
            type: EventType.skirmish,
            series: 1,
            region: Region.AMER,
            cutoff_date: new Date()
        }
    })
}

export const getMockSeries = () => {
    return {
        id: 1,
        name: 'Life of a carlobolla',
        image: PlaceholderImg,
        period: 'Q2 1999'
    }
}