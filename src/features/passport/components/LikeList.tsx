import PlaceListView, { Place } from "./PlaceList"
import SearchBar from './SearchBar'

type Props = {
    onSelectPlace?: (item: Place) => void
}

const LikeList = ({ onSelectPlace }: Props) => (
    <PlaceListView data={[]} onSelectPlace={onSelectPlace} />
)

export default LikeList