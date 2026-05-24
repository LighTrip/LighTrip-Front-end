import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    Dimensions,
    FlatList,
} from 'react-native';
import React, { useState } from 'react'
import colors from '@/src/constant/colors';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import { passportStyles, COVER_WIDTH, COVER_HEIGHT } from './passportStyles';
import { Place } from './PlaceList';

const chunkArray = <T,>(array: T[], size: number): T[][] => {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
        array.slice(i * size, i * size + size)
    );
};

const PLACES: Place[] = [
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
}, {} as Record<string, Place[]>)

const districts = Object.keys(districtGroups)

type Props = {
    onSelectPlace: (item: Place, group?: Place[]) => void
}

const PassportList = ({ onSelectPlace }: Props) => {
    const [selected, setSelected] = useState<'cover' | 'list'>('cover')
    const [searchSelected, setSearchSelected] = useState(false)
    const [sortVisible, setSortVisible] = useState(false)
    const [sortOption, setSortOption] = useState('최근 방문순')
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)

    const coverContent = selectedDistrict ? (
        <FlatList
            data={districtGroups[selectedDistrict]}
            keyExtractor={(item) => item.id}
            contentContainerStyle={passportStyles.listContainer}
            renderItem={({ item }) => (
                <TouchableOpacity style={passportStyles.listCard} onPress={() => onSelectPlace(item)}>
                    <Text style={passportStyles.stamp}>도장</Text>
                    <View style={passportStyles.textArea}>
                        <Text style={passportStyles.listName}>{item.name}</Text>
                        <View style={passportStyles.metaRow}>
                            <Text style={passportStyles.meta}>📍 {item.district}</Text>
                            <Text style={passportStyles.meta}>📅 {item.date}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            )}
        />
    ) : (
        <FlatList
            style={{ height: COVER_HEIGHT * 2, overflow: 'hidden' }}
            data={chunkArray(districts, 4)}
            keyExtractor={(_, index) => String(index)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item: pageItems }) => (
                <View style={styles.page}>
                    {pageItems.map((district) => (
                        <TouchableOpacity
                            key={district}
                            style={styles.passportCover}
                            onPress={() => {
                                const placesInDistrict = districtGroups[district]
                                onSelectPlace(placesInDistrict[0], placesInDistrict)
                            }}
                        >
                            <Image
                                source={districtGroups[district][0].image}
                                style={StyleSheet.absoluteFillObject}
                                resizeMode="cover"
                            />
                            <Text style={styles.placeName}>{district}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        />
    )

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.tabRow}>
                <>
                    <TouchableOpacity
                        style={[styles.tabButton, selected === 'cover' && styles.tabButtonActive]}
                        onPress={() => { setSelected('cover'); setSelectedDistrict(null) }}
                    >
                        <Text style={[styles.tabText, selected === 'cover' && styles.tabTextActive]}>여권</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, selected === 'list' && styles.tabButtonActive]}
                        onPress={() => setSelected('list')}
                    >
                        <Text style={[styles.tabText, selected === 'list' && styles.tabTextActive]}>도장</Text>
                    </TouchableOpacity>
                </>
            </View>

            <View style={passportStyles.searchRow}>
                {searchSelected ? (
                    <>
                        <TextInput
                            style={passportStyles.searchInput}
                            placeholder="기억에 남았던 장소를 입력하세요."
                            placeholderTextColor="#000000"
                            autoFocus
                        />
                        <TouchableOpacity
                            style={[passportStyles.iconButton, passportStyles.iconButtonActive]}
                            onPress={() => setSearchSelected(false)}
                        >
                            <Ionicons name="search" size={25} color={colors.text.primary} />
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={{ color: '#4c4c4c', fontSize: 16, fontWeight: '600', marginTop: 8, flex: 1 }}>
                            {selectedDistrict ? `${selectedDistrict}구` : sortOption}
                        </Text>
                        <View>
                            <TouchableOpacity style={passportStyles.iconButton} onPress={() => setSortVisible(!sortVisible)}>
                                <Image source={require('../../../../assets/icons/reorder.png')} />
                            </TouchableOpacity>
                            {sortVisible && (
                                <View style={passportStyles.dropdown}>
                                    {['최근 방문순', '오래된 순', '이름순'].map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={passportStyles.dropdownOption}
                                            onPress={() => { setSortOption(option); setSortVisible(false) }}
                                        >
                                            <Text style={passportStyles.dropdownText}>{option}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                        <TouchableOpacity
                            style={[passportStyles.iconButton, searchSelected && passportStyles.iconButtonActive]}
                            onPress={() => setSearchSelected(true)}
                        >
                            <Ionicons name="search" size={25} color="#000000" />
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {selected === 'cover' ? coverContent : (
                <FlatList
                    data={PLACES}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={passportStyles.listContainer}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={passportStyles.listCard} onPress={() => onSelectPlace(item)}>
                            <Text style={passportStyles.stamp}>도장</Text>
                            <View style={passportStyles.textArea}>
                                <Text style={passportStyles.listName}>{item.name}</Text>
                                <View style={passportStyles.metaRow}>
                                    <Text style={passportStyles.meta}>📍 {item.district}</Text>
                                    <Text style={passportStyles.meta}>📅 {item.date}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    )
}

export default PassportList

const styles = StyleSheet.create({
    tabRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginHorizontal: 13,
        marginBottom: 10,
        gap: 13,
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
        textAlignVertical: 'center',
    },
    tabTextActive: {
        color: '#ffffff',
        fontWeight: 'bold',
        includeFontPadding: false,
        textAlignVertical: 'center',
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
})
