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
import { useRouter } from 'expo-router';
import colors from '@/src/constant/colors';
import Ionicons from '@expo/vector-icons/build/Ionicons';

import PassportDetail from "../screens/PassportDetail";

const chunkArray = <T,>(array: T[], size: number): T[][] => {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
        array.slice(i * size, i * size + size)
    );
};

const PLACES: { id: string; name: string; image: any; district: string; date: string; category: string }[] = [
    { id: '1', name: '렉터스라운지 홍대', image: require('../../../../assets/images/mapo.png'), district: '마포', date: '2026-03-30', category: '카페' },
    { id: '2', name: '다운타우너', image: require('../../../../assets/images/yongsan.png'), district: '용산', date: '2026-03-16', category: '식당' },
    { id: '3', name: '포셋 연희', image: require('../../../../assets/images/seodaemun.png'), district: '서대문', date: '2026-02-24', category: '카페' },
    { id: '4', name: '명동 쇼핑 거리', image: require('../../../../assets/images/mapo.png'), district: '중구', date: '2026-04-12', category: '쇼핑' },
    { id: '5', name: '초이다이닝 강남', image: require('../../../../assets/images/yongsan.png'), district: '강남', date: '2026-01-30', category: '음식점' },
    { id: '6', name: '카페 드 파리', image: require('../../../../assets/images/seodaemun.png'), district: '서초', date: '2026-02-15', category: '카페' },
    { id: '7', name: '가게', image: require('../../../../assets/images/mapo.png'), district: '일산동구', date: '2026-03-05', category: '카페' },
];

type Props = {
    onSelectPlace: (item: typeof PLACES[0]) => void;
}

const PassportList = ({ onSelectPlace }: Props) => {

    const router = useRouter();
    // 장소별/위치별 탭 선택 상태
    const [selected, setSelected] = useState<'cover'| 'list'>('cover');
    // 돋보기 버튼 선택 상태
    const [searchSelected, setSearchSelected] = useState(false);
    // 정렬 버튼 선택 상태
    const [sortVisible, setSortVisible] = useState(false);
    const [sortOption, setSortOption] = useState('최근 방문순');

    return (
    
    <View style={{flex: 1}}> 
            {/* 탭 행 */}
            <View style={styles.tabRow} >
            
                <>
                {/* 위치별 여권 탭 (커버) */}
                <TouchableOpacity
                    style={[styles.tabButton, selected === 'cover' && styles.tabButtonActive]}
                    onPress={() => setSelected('cover')}
                >
                    <Text style={[styles.tabText, selected === 'cover' && styles.tabTextActive]}>
                    위치별 여권
                    </Text>
                </TouchableOpacity> 
                
                {/* 목록형 보기 */}
                <TouchableOpacity
                    style={[styles.tabButton, selected === 'list' && styles.tabButtonActive]}
                    onPress={() => setSelected('list')}
                >
                    <Text style={[styles.tabText, selected === 'list' && styles.tabTextActive]}>
                    장소별 여권
                    </Text>
                </TouchableOpacity> 
                </>
            
            </View>

            <View style={styles.searchRow}>
                {searchSelected ? (
                <>
                {/* 검색 입력 필드 */}
                <TextInput
                    style={styles.searchInput}
                    placeholder="기억에 남았던 장소를 입력하세요."
                    placeholderTextColor="#000000"
                    autoFocus
                />
                {/* 검색 취소 버튼 */}
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
                {/* 정렬 버튼 */}
                <View>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setSortVisible(!sortVisible)}>
                        <Image source={require('../../../../assets/icons/reorder.png')} />
                    </TouchableOpacity>

                    {/* 드롭다운 */}
                    {sortVisible && (
                        <View style={styles.dropdown}>
                            {['최근 방문순', '오래된 순', '이름순'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.dropdownOption}
                                    onPress={() => {
                                        console.log(option);
                                        setSortOption(option);
                                        setSortVisible(false);
                                    }}
                                >
                                    <Text style={styles.dropdownText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
                
                

                <TouchableOpacity
                    style={[styles.iconButton, searchSelected && styles.iconButtonActive] }
                    onPress={() => setSearchSelected(true)}
                >
                    <Ionicons name="search" size={25} color="#000000" />
                </TouchableOpacity> 
                </>
            )
        }

            </View>

            {/* 각 탭별 내용 */}
            {selected === 'cover' ? (
            <FlatList
                style={{ flex: 1 }}
                data={chunkArray(PLACES, 4)}      
                keyExtractor={(_, index) => String(index)}
                horizontal={true}
                pagingEnabled={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item: pageItems }) => (
                    <View style={styles.page}>
                        {pageItems.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.passportCover}
                                onPress={() => console.log(item.name)}
                            >
                                <Image
                                    source={item.image}
                                    style={StyleSheet.absoluteFillObject}
                                    resizeMode="cover"
                                />
                                <Text style={styles.placeName}>{item.district}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            />
            ) : (
            <FlatList
            data={PLACES}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
                <TouchableOpacity style={styles.listCard} onPress={() => onSelectPlace(item)}>
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
            )}
        </View>
  );
};

export default PassportList

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
        // alignItems: 'center',
        justifyContent: 'flex-end',
        marginHorizontal: 13,
        marginBottom: 10,
        gap: 13,
        paddingTop: 0,
        marginTop: 10,
    },

    searchRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginHorizontal: 15,
        gap: 5,
        paddingTop: 0,
        marginTop: 5,
        marginLeft: 20,
    },
    
    statCard: {
        width: 110,
        height: 80,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#1A3A6B',
        alignItems: 'center',
        justifyContent: 'center',
        

        marginRight: 16,

        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 4,
    },

    tabButton: {
        width: Dimensions.get('window').width - 227,
        height: 39,
        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 1,

        paddingVertical: 0,
        paddingHorizontal: 16,

        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#1A3A6B',

        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 4,
    },

    tabButtonActive: {
        backgroundColor: '#1A3A6B',
        borderColor: '#1A3A6B',

        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 4,
    },

    tabText: {
        color: '#4c4c4c90',
        fontSize: 16,
        fontWeight: 'bold',

        // 안드로이드 폰트 패딩 문제 해결
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

        // 안드로이드 폰트 패딩 문제 해결
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

        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 4,
    },

    iconButtonActive: {
        width: 39,
        height: 39,
        backgroundColor: '#1A3A6B',
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 4,
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

        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 4,
    },

    gridContainer: {
        flexDirection: 'row',
        marginLeft: 10,
        gap: 8,
        paddingRight: 10,
    },

    gridColumn: {
        flexDirection: 'column',
        gap: 8,
    }, 

    page: {
        width: Dimensions.get('window').width,
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        marginLeft: 10,
    },
    
    // 여권 커버
    passportCover: {
        width: Dimensions.get('window').width / 2,
        height: 280,
        justifyContent: 'flex-start',
        alignItems: 'center',
        overflow: 'hidden',
        
    },

    placeName: {
        color: '#FFFFFF',
        fontSize: 20,
        fontStyle: 'italic',
        fontWeight: '600',
    },

    // 리스트뷰
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
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
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
