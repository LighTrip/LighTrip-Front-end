import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    Dimensions,
    StatusBar,
    FlatList,
} from 'react-native';
import React, { useState } from 'react'
import colors from '@/src/constant/colors';
import Ionicons from '@expo/vector-icons/build/Ionicons';

const PLACES: { id: string; name: string; image: any; district: string; date: string; category: string }[] = [
    { id: '1', name: '렉터스라운지 홍대', image: require('../../../../assets/images/mapo.png'), district: '마포', date: '2026-03-30', category: '카페' },
    { id: '2', name: '다운타우너', image: require('../../../../assets/images/yongsan.png'), district: '용산', date: '2026-03-16', category: '식당' },
    { id: '3', name: '포셋 연희', image: require('../../../../assets/images/seodaemun.png'), district: '서대문', date: '2026-02-24', category: '카페' },
    { id: '4', name: '명동 쇼핑 거리', image: require('../../../../assets/images/mapo.png'), district: '중구', date: '2026-04-12', category: '쇼핑' },
    { id: '5', name: '초이다이닝 강남', image: require('../../../../assets/images/yongsan.png'), district: '강남', date: '2026-01-30', category: '음식점' },
    { id: '6', name: '카페 드 파리', image: require('../../../../assets/images/seodaemun.png'), district: '서초', date: '2026-02-15', category: '카페' },
    { id: '7', name: '가게', image: require('../../../../assets/images/mapo.png'), district: '일산동구', date: '2026-03-05', category: '카페' },
    { id: '8', name: '식당', image: require('../../../../assets/images/yongsan.png'), district: '용산', date: '2026-02-11', category: '식당' },
];

const districtGroups = PLACES.reduce((acc, place) => {
    if (!acc[place.district]) acc[place.district] = []
    acc[place.district].push(place)
    return acc
}, {} as Record<string, typeof PLACES>)

const districts = Object.keys(districtGroups)

const COVER_WIDTH = (Dimensions.get('window').width - 15 * 2 - 1) / 2
const COVER_HEIGHT = COVER_WIDTH * (4 / 3)

type Props = {
    onSelectPlace?: (item: typeof PLACES[0], group?: typeof PLACES) => void
}

const ScrapList = ({ onSelectPlace }: Props) => {
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
                data={PLACES}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
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

export default ScrapList

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFD',
        justifyContent: 'flex-start',
        paddingTop: StatusBar.currentHeight || 65,
    },

    title: {
        color: '#000000',
        fontSize: 24,
        textAlign: 'left',
        fontWeight: 'bold',
        marginBottom: 10,
        marginLeft: 20,
        marginTop: 20,
    },

    tabRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginHorizontal: 13,
        marginBottom: 10,
        gap: 13,
    },

    searchRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginHorizontal: 15,
        gap: 5,
        marginTop: 5,
        marginLeft: 20,
    },

    tabButton: {
        width: COVER_WIDTH * 0.96,
        height: 39,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#1A3A6B',
    },

    tabButtonActive: {
        backgroundColor: '#1A3A6B',
        borderColor: '#1A3A6B',
    },

    tabText: {
        color: '#4c4c4c90',
        fontSize: 16,
        fontWeight: 'bold',
        includeFontPadding: false,
        textAlignVertical: 'center'
    },

    numText: {
        color: '#000000',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    statText: {
        color: '#000000',
        fontSize: 14,
        textAlign: 'center',
    },

    tabTextActive: {
        color: '#ffffff',
        fontWeight: 'bold',
        includeFontPadding: false,
        textAlignVertical: 'center'
    },

    iconButton: {
        width: 39,
        height: 39,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#1A3A6B',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 5,
    },

    iconButtonActive: {
        width: 39,
        height: 39,
        backgroundColor: '#1A3A6B',
    },

    searchInput: {
        width: Dimensions.get('window').width - 80,
        height: 39,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#1A3A6B',
        paddingVertical: 8,
        paddingHorizontal: 16,
        fontSize: 14,
        fontWeight: 'bold',
    },

    page: {
        width: Dimensions.get('window').width,
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 3,
        paddingHorizontal: 15,
        justifyContent: 'flex-start',
        gap: 1, 
    },

    passportCover: {
        width: COVER_WIDTH,
        height: COVER_HEIGHT,
        borderRadius: 16,
        overflow: 'hidden',
        alignItems: 'center',
    },

    placeName: {
        position: 'absolute',
        top: '30%',
        color: '#FFFFFF',
        fontSize: 28,
        fontFamily: 'Freesentation',
    },

    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },

    listCard: {
        width: Dimensions.get('window').width - 32,
        height: 85,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginTop: 10,
        marginBottom: 10,
        alignItems: 'center',

        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 4,
    },

    listName: {
        color: '#000000',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },

    stamp: {
        color: '#000000',
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 12,
        padding: 15,
    },

    textArea: {
        flex: 1,
    },

    metaRow: {
        flexDirection: 'row',
        gap: 24,
    },

    meta: {
        color: '#000000',
        fontSize: 14,
        fontWeight: '500',
    },

    dropdown: {
        position: 'absolute',
        top: 44,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#1A3A6B',
        zIndex: 999,
        minWidth: 130,
    },

    dropdownOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    dropdownText: {
        fontSize: 14,
        color: '#000',
    },
});