// src/components/common/KakaoPlaceSearch.tsx
import React, { useState } from 'react'
import { Modal, View, TouchableOpacity, TextInput, FlatList, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY

type Props = {
    visible: boolean
    onSelect: (item: { place_name: string; address_name: string; x: string; y: string }) => void
    onClose: () => void
}

const KakaoPlaceSearch = ({ visible, onSelect, onClose }: Props) => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])

    const searchPlace = async (text: string) => {
        if (!text.trim()) return
        try {
            const response = await fetch(
                `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(text)}&size=10`,
                { headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` } }
            )
            const data = await response.json()
            setResults(data.documents ?? [])
        } catch (err) {
            console.error('장소 검색 실패:', err)
        }
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
                            placeholder="장소명 검색 (예: 스타벅스 이태원)"
                            placeholderTextColor="#aaa"
                            value={query}
                            onChangeText={(text) => { setQuery(text); searchPlace(text) }}
                            autoFocus
                        />
                    </View>
                    <FlatList
                        data={results}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}
                                onPress={() => { onSelect(item); handleClose() }}
                            >
                                <Text style={{ fontSize: 14, fontWeight: '600', color: '#222' }}>{item.place_name}</Text>
                                <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{item.address_name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </TouchableOpacity>
        </Modal>
    )
}

export default KakaoPlaceSearch