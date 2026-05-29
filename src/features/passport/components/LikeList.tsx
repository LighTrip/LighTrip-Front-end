import { getMyLikes, LikePassport } from '@/src/api/list/like.api'
import FavouriteList from './FavouriteList'

const LikeList = ({ onSelectPlace }: { onSelectPlace?: (item: LikePassport) => void }) => (
    <FavouriteList
        fetchData={() => getMyLikes().then(res => res.data.data.content)}
        keyExtractor={(item) => item.likeId.toString()}
        emptyText="아직 좋아요한 장소가 없어요 🗺️"
        onSelectPlace={onSelectPlace}
        renderName={(item) => item.spaceName}
        renderAddress={(item) => item.address}
    />
)

export default LikeList