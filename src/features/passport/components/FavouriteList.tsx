// FavouriteList.tsx
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native'
import { passportStyles as styles } from './passportStyles'

type Props<T> = {
    fetchData: () => Promise<T[]>
    keyExtractor: (item: T) => string
    emptyText: string
    onSelectPlace?: (item: T) => void
    renderName: (item: T) => string
    renderAddress: (item: T) => string
    renderThumbnail?: (item: T) => string | null
    renderContent?: (item: T) => string
    renderDate?: (item: T) => string
    dateLabel?:string
    renderLikeCount?: (item: T) => number
    renderScrapCount?: (item: T) => number
}

const formatDate = (dateString?: string) => {
    if (!dateString) return ''

    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}.${month}.${day}`
}

const FavouriteList = <T,>({
    fetchData,
    keyExtractor,
    emptyText,
    onSelectPlace,
    renderName,
    renderAddress,
    renderThumbnail,
    renderContent,
    renderDate,
    dateLabel="저장일",
    renderLikeCount,
    renderScrapCount,
}: Props<T>) => {
    const [items, setItems] = useState<T[]>([])

    useFocusEffect(
        useCallback(() => {
            fetchData()
                .then(setItems)
                .catch(console.error)
        }, [fetchData])
    )

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={items}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 60 }}>
                        <Text style={{ color: '#aaa', fontSize: 15 }}>
                            {emptyText}
                        </Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const thumbnailUrl = renderThumbnail?.(item)
                    const dateText = renderDate ? formatDate(renderDate(item)) : ''

                    return (
                        <TouchableOpacity
                            style={styles.listCard}
                            onPress={() => onSelectPlace?.(item)}
                            activeOpacity={0.85}
                        >
                            <View style={styles.thumbnailArea}>
                                {thumbnailUrl ? (
                                    <Image
                                        source={{ uri: thumbnailUrl }}
                                        style={styles.listThumbnail}
                                    />
                                ) : (
                                    <View style={styles.listThumbnailPlaceholder}>
                                        <Text style={styles.placeholderText}>
                                            No Image
                                        </Text>
                                    </View>
                                )}

                                {dateText && (
                                    <View style={styles.dateBadge}>
                                        <Text style={styles.dateText}>
                                            {dateLabel} {dateText}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.cardBody}>
                                <View style={styles.placeTitleRow}>
                                    <Ionicons
                                        name="location"
                                        size={20}
                                        color="#1A3A6B"
                                        style={styles.locationIcon}
                                    />
                                        <Text style={styles.listName} numberOfLines={1}>
                                            {renderName(item)}
                                        </Text>
                                </View>

                                <Text style={styles.meta} numberOfLines={1}>
                                        {renderAddress(item)}
                                </Text>

                                {renderContent && (
                                    <Text style={styles.contentText} numberOfLines={2}>
                                        {renderContent(item)}
                                    </Text>
                                )}

                                <View style={styles.divider} />

                                <View style={styles.countRow}>
                                    <View style={styles.countItem}>
                                        <Ionicons
                                            name="heart"
                                            size={20}
                                            color="#FF7A8A"
                                        />

                                        <Text style={styles.countText}>
                                            {renderLikeCount ? renderLikeCount(item) : 0}
                                        </Text>
                                    </View>

                                    <View style={styles.countItem}>
                                        <Ionicons
                                            name="bookmark"
                                            size={20}
                                            color="#1A3A6B"
                                        />

                                        <Text style={styles.countText}>
                                            {renderScrapCount ? renderScrapCount(item) : 0}
                                        </Text>
                                    </View>

                                    <Ionicons
                                        name="chevron-forward"
                                        size={22}
                                        color="#9CA3AF"
                                        style={styles.arrowIcon}
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>
                    )
                }}
            />
        </View>
    )
}

export default FavouriteList