import colors from "@/src/constant/colors";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
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
    ScrollView,
} from 'react-native';

const chunkArray = <T,>(array: T[], size: number): T[][] => {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
        array.slice(i * size, i * size + size)
    );
};

 const PLACES: { id: string; name: string; image: any; district: string; date: string }[] = [
    { id: '1', name: '렉터스라운지 홍대', image: require('../../../../assets/images/mapo.png'), district: '마포', date: '2026-03-30' },
    { id: '2', name: '다운타우너', image: require('../../../../assets/images/yongsan.png'), district: '용산', date: '2026-03-16' },
    { id: '3', name: '포셋 연희', image: require('../../../../assets/images/seodaemun.png'), district: '서대문', date: '2026-02-24' },
    { id: '4', name: '명동 쇼핑 거리', image: require('../../../../assets/images/mapo.png'), district: '중구', date: '2026-04-12' },
    { id: '5', name: '초이다이닝 강남', image: require('../../../../assets/images/yongsan.png'), district: '강남', date: '2026-01-30' },
    { id: '6', name: '카페 드 파리', image: require('../../../../assets/images/seodaemun.png'), district: '서초', date: '2026-02-15' },
    { id: '7', name: '가게', image: require('../../../../assets/images/mapo.png'), district: '일산동구', date: '2026-03-05' },
];

export default function PassportView() {
    const router = useRouter();
    // 장소별/위치별 탭 선택 상태
    const [selected, setSelected] = useState<'cover'| 'list'>('cover');
    // 돋보기 버튼 선택 상태
    const [searchSelected, setSearchSelected] = useState(false);

    return (
        
        <View style={styles.container}>
            
            <Text style={styles.title}>나의 여권</Text>

            <View style={styles.tabRow}>
                <View style={styles.statCard}>
                    <Text style={styles.numText}>
                    26
                    </Text>
                    <Text style={styles.statText}>
                    총 도장
                    </Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.numText}>
                    18
                    </Text>
                    <Text style={styles.statText}>
                    방문한 곳
                    </Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.numText}>
                    7
                    </Text>
                    <Text style={styles.statText}>
                    방문한 구
                    </Text>
                </View>
            </View>

            {/* 탭 행 */}
            <View style={styles.tabRow}>
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

                {/* 정렬 버튼 */}
                <TouchableOpacity style={styles.iconButton}>
                    <Text style={{ color: '#1A3A6B', fontSize: 23 }}>☰</Text>
                </TouchableOpacity> 
                
                {/* 검색 버튼 */}
                <TouchableOpacity
                    style={[styles.iconButton, searchSelected && styles.iconButtonActive] }
                    onPress={() => setSearchSelected(true)}
                >
                    <Ionicons name="search" size={25} color={colors.text.muted} />
                </TouchableOpacity> 
                </>
            )}
            </View>

            {/* 각 탭별 내용 */}
            {selected === 'cover' ? (
            <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.gridContainer}
            >
                {chunkArray(PLACES, 2).map((row, rowIndex) => (  // 2 → 3으로 바꾸면 3x3
                    <View key={rowIndex} style={styles.gridColumn}>
                        {row.map((item) => (
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
                ))}
            </ScrollView>
            ) : (
            <FlatList
            data={PLACES}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
                <TouchableOpacity style={styles.listCard} onPress={() => console.log(item.name)}>
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
}


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
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 10,
        gap: 8,
        paddingTop: 0,
        marginTop: 10,
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
        width: 130,
        height: 39,
        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 5,

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

    passportCover: {
        width: Dimensions.get('window').width - 216,
        height: 250,
        borderTopRightRadius: 15,
        borderBottomRightRadius: 15,

        justifyContent: 'flex-start',
        alignItems: 'center',

        padding: 30,

        overflow: 'hidden',

        marginTop: 8,
    },

    placeName: {
        color: '#FFFFFF',
        fontSize: 20,
        fontStyle: 'italic',
        fontWeight: '600',
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

});