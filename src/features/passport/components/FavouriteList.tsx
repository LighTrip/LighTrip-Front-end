// FavouriteList.tsx
import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import { passportStyles as styles } from './passportStyles'
import { useFocusEffect } from 'expo-router'

type Props<T> = {
    fetchData: () => Promise<T[]>
    keyExtractor: (item: T) => string
    emptyText: string
    onSelectPlace?: (item: T) => void
    renderName: (item: T) => string
    renderAddress: (item: T) => string
}

const FavouriteList = <T,>({ fetchData, keyExtractor, emptyText, onSelectPlace, renderName, renderAddress }: Props<T>) => {
    const [items, setItems] = useState<T[]>([])

    useFocusEffect(
        useCallback(() => {
            fetchData().then(setItems).catch(console.error)
        }, [])
    )

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={items}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 60 }}>
                        <Text style={{ color: '#aaa', fontSize: 15 }}>{emptyText}</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.listCard} onPress={() => onSelectPlace?.(item)}>
                        <View style={styles.textArea}>
                            <Text style={styles.listName}>{renderName(item)}</Text>
                            <View style={styles.metaRow}>
                                <Text style={styles.meta}>📍 {renderAddress(item)}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    )
}

export default FavouriteList