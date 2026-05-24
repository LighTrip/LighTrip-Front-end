import PlaceListView, { Place } from "./PlaceList"

type Props = {
    onSelectPlace?: (item: Place) => void
}

const ScrapList = ({ onSelectPlace }: Props) => (
    <PlaceListView data={[]} onSelectPlace={onSelectPlace} />
)

export default ScrapList