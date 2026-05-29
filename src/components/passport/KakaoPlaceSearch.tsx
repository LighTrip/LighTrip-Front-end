// KakaoPlaceSearch.tsx
import React from 'react'
import { TouchableOpacity, Text } from 'react-native'
import SearchModal from '@/src/components/passport/SearchModal'

const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY

type KakaoPlace = {
    id: string
    place_name: string
    address_name: string
    x: string
    y: string
}

type Props = {
    visible: boolean
    onSelect: (item: KakaoPlace) => void
    onClose: () => void
}

const KakaoPlaceSearch = ({ visible, onSelect, onClose }: Props) => (
    <SearchModal<KakaoPlace>
        visible={visible}
        onClose={onClose}
        placeholder="장소명 검색 (예: 스타벅스 이태원)"
        fetchResults={async (query) => {
            const res = await fetch(
                `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=10`,
                { headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` } }
            )
            const data = await res.json()
            return data.documents ?? []
        }}
        keyExtractor={(item) => item.id}
        onSelect={onSelect}
        renderItem={(item, onSelect) => (
            <TouchableOpacity
                style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}
                onPress={() => onSelect(item)}
            >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#222' }}>{item.place_name}</Text>
                <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{item.address_name}</Text>
            </TouchableOpacity>
        )}
    />
)

export default KakaoPlaceSearch