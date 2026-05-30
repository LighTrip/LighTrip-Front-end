import { getMyScraps, ScrapPassport } from '@/src/api/list/scrap.api'
import FavouriteList from './FavouriteList'

const ScrapList = ({ onSelectPlace }: { onSelectPlace?: (item: ScrapPassport) => void }) => (
    <FavouriteList
        fetchData={() => getMyScraps().then(res => res.data.data.content)}
        keyExtractor={(item) => item.scrapId.toString()}
        emptyText="아직 스크랩한 장소가 없어요 🗺️"
        onSelectPlace={onSelectPlace}
        renderName={(item) => item.spaceName}
        renderAddress={(item) => item.address}
        renderThumbnail={(item) => item.thumbnailUrl}
        renderContent={(item) => item.content}
        renderDate={(item) => item.scrapCreatedAt}
        dateLabel='저장일'
        renderLikeCount={(item) => item.likeCount}
        renderScrapCount={(item) => item.scrapCount}
    />
)

export default ScrapList