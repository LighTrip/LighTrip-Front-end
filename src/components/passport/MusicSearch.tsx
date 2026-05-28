// src/components/common/MusicSearch.tsx
import React, { useState } from 'react'
import { Modal, View, TouchableOpacity, TextInput, FlatList, Text, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

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

const MusicSearch = ({ visible, onSelect, onClose }: Props) => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])

    const searchMusic = async (text: string) => {
        if (!text.trim()) return
        const response = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(text)}&media=music&limit=10`
        )
        const data = await response.json()
        setResults(data.results)
    }

    const handleClose = () => {
        setQuery('')
        setResults([])
        onClose()
    }

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#00000040', justifyContent: 'flex-end' }}
                onPress={handleClose}
                activeOpacity={1}
            >
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8, marginBottom: 12 }}>
                        <Ionicons name="search-outline" size={18} color="#aaa" />
                        <TextInput
                            style={{ flex: 1, fontSize: 14, color: '#222' }}
                            placeholder="곡 제목이나 아티스트 검색"
                            placeholderTextColor="#aaa"
                            value={query}
                            onChangeText={(text) => { setQuery(text); searchMusic(text) }}
                            autoFocus
                        />
                    </View>
                    <FlatList
                        data={results}
                        keyExtractor={(item) => item.trackId.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}
                                onPress={() => {
                                    onSelect({ title: item.trackName, artist: item.artistName, artwork: item.artworkUrl100 })
                                    handleClose()
                                }}
                            >
                                <Image source={{ uri: item.artworkUrl100 }} style={{ width: 48, height: 48, borderRadius: 8 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#222' }} numberOfLines={1}>{item.trackName}</Text>
                                    <Text style={{ fontSize: 12, color: '#888' }} numberOfLines={1}>{item.artistName}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </TouchableOpacity>
        </Modal>
    )
}

export default MusicSearch