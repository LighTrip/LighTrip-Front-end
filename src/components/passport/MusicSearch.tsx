// src/components/common/MusicSearch.tsx
import React from 'react'
import { TouchableOpacity, Text, Image, View } from 'react-native'
import SearchModal from '@/src/components/passport/SearchModal'

type ItunesItem = {
    trackId: number
    trackName: string
    artistName: string
    artworkUrl100: string
}

type MusicItem = {
    title: string
    artist: string
    artwork: string
}

type Props = {
    visible: boolean
    onSelect: (item: MusicItem) => void
    onClose: () => void
}

const MusicSearch = ({ visible, onSelect, onClose }: Props) => (
    <SearchModal<ItunesItem>
        visible={visible}
        onClose={onClose}
        placeholder="곡 제목이나 아티스트 검색"
        fetchResults={async (query) => {
            const res = await fetch(
                `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=10`
            )
            const data = await res.json()
            return data.results
        }}
        keyExtractor={(item) => item.trackId.toString()}
        onSelect={(item) => onSelect({ title: item.trackName, artist: item.artistName, artwork: item.artworkUrl100 })}
        renderItem={(item, onSelect) => (
            <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}
                onPress={() => onSelect(item)}
            >
                <Image source={{ uri: item.artworkUrl100 }} style={{ width: 48, height: 48, borderRadius: 8 }} />
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#222' }} numberOfLines={1}>{item.trackName}</Text>
                    <Text style={{ fontSize: 12, color: '#888' }} numberOfLines={1}>{item.artistName}</Text>
                </View>
            </TouchableOpacity>
        )}
    />
)

export default MusicSearch