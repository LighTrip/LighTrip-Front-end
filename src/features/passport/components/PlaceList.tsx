import {
    View,
    Text,
    Image,
    TouchableOpacity,
    TextInput,
    FlatList,
} from 'react-native';
import React, { useState } from 'react'
import colors from '@/src/constant/colors';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import { passportStyles as styles } from './passportStyles';

export type Place = {
    id: string
    name: string
    image: any
    district: string
    date: string
    category: string
}

type Props = {
    data: Place[]
    onSelectPlace?: (item: Place) => void
}

const PlaceListView = ({ data, onSelectPlace }: Props) => {
    const [searchSelected, setSearchSelected] = useState(false)
    const [sortVisible, setSortVisible] = useState(false)
    const [sortOption, setSortOption] = useState('최근 방문순')

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.searchRow}>
                {searchSelected ? (
                    <>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="기억에 남았던 장소를 입력하세요."
                            placeholderTextColor="#000000"
                            autoFocus
                        />
                        <TouchableOpacity
                            style={[styles.iconButton, styles.iconButtonActive]}
                            onPress={() => setSearchSelected(false)}
                        >
                            <Ionicons name="search" size={25} color={colors.text.primary} />
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={{ color: '#4c4c4c', fontSize: 16, fontWeight: '600', marginTop: 8, flex: 1 }}>
                            {sortOption}
                        </Text>
                        <View>
                            <TouchableOpacity style={styles.iconButton} onPress={() => setSortVisible(!sortVisible)}>
                                <Image source={require('../../../../assets/icons/reorder.png')} />
                            </TouchableOpacity>
                            {sortVisible && (
                                <View style={styles.dropdown}>
                                    {['최근 방문순', '오래된 순', '이름순'].map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={styles.dropdownOption}
                                            onPress={() => {
                                                setSortOption(option)
                                                setSortVisible(false)
                                            }}
                                        >
                                            <Text style={styles.dropdownText}>{option}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => setSearchSelected(true)}
                        >
                            <Ionicons name="search" size={25} color="#000000" />
                        </TouchableOpacity>
                    </>
                )}
            </View>

            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 60 }}>
                        <Text style={{ color: '#aaa', fontSize: 15 }}>아직 등록된 장소가 없어요 🗺️</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.listCard} onPress={() => onSelectPlace?.(item)}>
                        <Text style={styles.stamp}>도장</Text>
                        <View style={styles.textArea}>
                            <Text style={styles.listName}>{item.name}</Text>
                            <View style={styles.metaRow}>
                                <Text style={styles.meta}>📍 {item.district}</Text>
                                <Text style={styles.meta}>📅 {item.date}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    )
}

export default PlaceListView
