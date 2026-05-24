import PlaceListView, { Place } from "./PlaceList"

type Props = {
    onSelectPlace?: (item: Place) => void
}

const LikeList = ({ onSelectPlace }: Props) => (
    <PlaceListView data={[]} onSelectPlace={onSelectPlace} />
)

export default LikeList