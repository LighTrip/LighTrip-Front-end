import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import { passportStyles as styles } from './passportStyles'
import { getMyLikes, LikePassport } from '@/src/api/list/like.api'
import { useFocusEffect } from 'expo-router'

type Props = {
    onSelectPlace?: (item: LikePassport) => void
}

const LikeList = ({ onSelectPlace }: Props) => {
    const [likes, setLikes] = useState<LikePassport[]>([])

    useFocusEffect(
        useCallback(() => {
            fetchLikes()
        }, [])
    )

    const fetchLikes = async () => {
        try {
            const res = await getMyLikes()
            setLikes(res.data.data.content)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={likes}
                keyExtractor={(item) => item.likeId.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 60 }}>
                        <Text style={{ color: '#aaa', fontSize: 15 }}>아직 좋아요한 장소가 없어요 🗺️</Text>
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

export default LikeList