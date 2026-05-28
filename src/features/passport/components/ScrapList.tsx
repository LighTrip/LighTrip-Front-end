import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import { passportStyles as styles } from './passportStyles'
import { getMyScraps, ScrapPassport } from '@/src/api/list/scrap.api'
import { useFocusEffect } from 'expo-router'

type Props = {
    onSelectPlace?: (item: ScrapPassport) => void
}

const ScrapList = ({ onSelectPlace }: Props) => {
    const [scraps, setScraps] = useState<ScrapPassport[]>([])

    useFocusEffect(
        useCallback(() => {
            fetchScraps()
        }, [])
    )

    const fetchScraps = async () => {
        try {
            const res = await getMyScraps()
            setScraps(res.data.data.content)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={scraps}
                keyExtractor={(item) => item.scrapId.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 60 }}>
                        <Text style={{ color: '#aaa', fontSize: 15 }}>아직 스크랩한 장소가 없어요 🗺️</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.listCard} onPress={() => onSelectPlace?.(item)}>
                        <View style={styles.textArea}>
                            <Text style={styles.listName}>{item.spaceName}</Text>
                            <View style={styles.metaRow}>
                                <Text style={styles.meta}>📍 {item.address}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    )
}

export default ScrapList