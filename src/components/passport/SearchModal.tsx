// src/components/common/SearchModal.tsx
import React, { useState } from 'react'
import { Modal, View, TouchableOpacity, TextInput, FlatList, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type Props<T> = {
    visible: boolean
    onClose: () => void
    placeholder: string
    fetchResults: (query: string) => Promise<T[]>
    keyExtractor: (item: T) => string
    renderItem: (item: T, onSelect: (item: T) => void) => React.ReactNode
    onSelect: (item: T) => void
}

const SearchModal = <T,>({ visible, onClose, placeholder, fetchResults, keyExtractor, renderItem, onSelect }: Props<T>) => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<T[]>([])

    const handleSearch = async (text: string) => {
        setQuery(text)
        if (!text.trim()) return
        try {
            const data = await fetchResults(text)
            setResults(data)
        } catch (err) {
            console.error('검색 실패:', err)
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
                            placeholder={placeholder}
                            placeholderTextColor="#aaa"
                            value={query}
                            onChangeText={handleSearch}
                            autoFocus
                        />
                    </View>
                    <FlatList
                        data={results}
                        keyExtractor={keyExtractor}
                        renderItem={({ item }) => <>{renderItem(item, onSelect)}</>}
                    />
                </View>
            </TouchableOpacity>
        </Modal>
    )
}

export default SearchModal