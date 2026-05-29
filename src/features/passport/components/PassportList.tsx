import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    FlatList,
} from 'react-native';
import { useFocusEffect } from 'expo-router'
import React, { useState, useCallback, useEffect } from 'react'
import { COVER_WIDTH, COVER_HEIGHT } from './passportStyles';
import PlaceListView from './PlaceListView';
import SearchBar from './SearchBar'
import { getDistrictsPassports, getMyPassportDistricts, getMyPassports, MyPassport } from '@/src/api/passport/passport.api'

const chunkArray = <T,>(array: T[], size: number): T[][] => {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
        array.slice(i * size, i * size + size)
    );
};

type Props = {
    onSelectPlace: (item: MyPassport, group?: MyPassport[]) => void
    initialTab?: 'cover' | 'list'
    onTabChange?: (tab: 'cover' | 'list') => void
}

const PassportList = ({ onSelectPlace, initialTab = 'cover', onTabChange }: Props) => {
    const [selected, setSelected] = useState<'cover' | 'list'>(initialTab)
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
    const [districts, setDistricts] = useState<any[]>([])  
    const [passports, setPassports] = useState<MyPassport[]>([])
    const [coverSortOrder, setCoverSortOrder] = useState('최근 방문순')
    const [listSortOrder, setListSortOrder] = useState('최근 방문순')
    const [searchQuery, setSearchQuery] = useState('')

    useFocusEffect(
        useCallback(() => {
            fetchDistricts()
            fetchPassports()   // 도장 탭용
        }, [])
    )
    
    useEffect(() => {
        if (initialTab) setSelected(initialTab)
    }, [initialTab])

    const sortedDistricts = [...districts].sort((a, b) => {
        if (coverSortOrder === '이름순') return a.displayName.localeCompare(b.displayName)
        return 0
    })

    const sortedPassports = [...passports].sort((a, b) => {
        if (listSortOrder === '이름순') return a.spaceName.localeCompare(b.spaceName, 'ko')
        return 0
    })

    const filteredPassports = sortedPassports.filter(p => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (
            p.spaceName?.toLowerCase().includes(q) ||
            p.districtDisplayName?.toLowerCase().includes(q) ||
            p.categoryDisplayName?.toLowerCase().includes(q)
        )
    })

    const filteredDistricts = sortedDistricts.filter(d => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return d.displayName?.toLowerCase().includes(q)
    })

    const fetchPassports = async () => {
        try {
            const res = await getMyPassports()
            setPassports(res.data?.data?.content ?? [])
        } catch (e) {
            console.error(e)
        }
    }

    const fetchDistricts = async () => {
        try {
            const res = await getMyPassportDistricts()
            console.log('districts[0]:', JSON.stringify(res.data?.data?.[0]))

            setDistricts(res.data?.data ?? [])
        } catch (e) {
            console.error(e)
        }
    }

    const handleDistrictPress = async (district: any) => {
        try {
            const res = await getDistrictsPassports(district.districtCategory)
            const items: MyPassport[] = res.data?.data?.content ?? []
            if (items.length > 0) {
                onSelectPlace(items[0], items)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const coverContent = selectedDistrict ? (
        <PlaceListView
            data={sortedPassports}
            onSelectPlace={onSelectPlace}
        />
    ) : (
        <FlatList
            style={{ height: COVER_HEIGHT * 2, overflow: 'hidden' }}
            data={chunkArray(filteredDistricts, 4)}
            keyExtractor={(_, index) => String(index)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item: pageItems }) => (
                <View style={styles.page}>
                    {pageItems.map((district) => (
                        <TouchableOpacity
                            key={district.districtCategory}
                            style={styles.passportCover}
                            onPress={() => handleDistrictPress(district)}
                        >
                            <Image
                                source={{ uri: district.thumbnailUrl }}
                                style={[StyleSheet.absoluteFillObject, {
                                    borderTopRightRadius: 16, 
                                    borderBottomRightRadius: 16,
                                }]}
                                resizeMode="cover"
                            />
                            <Text style={styles.placeName}>{district.displayName}</Text>
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
                        onPress={() => { setSelected('cover'); setSelectedDistrict(null); onTabChange?.('cover')  }}
                    >
                        <Text style={[styles.tabText, selected === 'cover' && styles.tabTextActive]}>여권</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, selected === 'list' && styles.tabButtonActive]}
                        onPress={() => { setSelected('list'); onTabChange?.('list') }}
                    >
                        <Text style={[styles.tabText, selected === 'list' && styles.tabTextActive]}>도장</Text>
                    </TouchableOpacity>
                </>
            </View>

            <SearchBar 
            label={selectedDistrict ? `${selectedDistrict}구` : undefined} 
            onSortChange={selected === 'cover' ? setCoverSortOrder : setListSortOrder}
            onSearchChange={setSearchQuery}
            />

            {selected === 'cover' ? coverContent : (
                <PlaceListView
                    data={filteredPassports}
                    onSelectPlace={onSelectPlace}
                />
            )}
        </View>
    )
}

export default PassportList

const styles = StyleSheet.create({
    tabRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 5,
    },

    tabButton: {
        width: COVER_WIDTH * 0.99,
        height: 39,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
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
        marginTop: 10,
        paddingHorizontal: 15,
        justifyContent: 'flex-start',
        gap: 11,
    },
    passportCover: {
        width: COVER_WIDTH,
        height: COVER_HEIGHT * 0.98,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        alignItems: 'center',
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 3, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },

    placeName: {
        position: 'absolute',
        top: '30%',
        color: '#FFFFFF',
        fontSize: 28,
        fontFamily: 'Freesentation',
    },
})