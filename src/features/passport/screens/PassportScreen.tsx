import colors from "@/src/constant/colors";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  FlatList,
} from 'react-native';

 const PLACES: { id: string; name: string; color: [string, string]; district: string; date: string }[] = [
    { id: '1', name: '렉터스라운지 홍대',      color: ['#E8B4B8', '#FFFFFF'], district: '마포구', date: '2026-03-30' },
    { id: '2', name: '다운타우너',   color: ['#B4C8E8', '#FFFFFF'], district: '용산구', date: '2026-03-16' },
    { id: '3', name: '포셋 연희', color: ['#B4E8C8', '#FFFFFF'], district: '성동구', date: '2026-02-24' },
    { id: '4', name: '명동 쇼핑 거리',    color: ['#E8D9B4', '#FFFFFF'], district: '중구', date: '2026-04-12' },
    { id: '5', name: '초이다이닝 강남',   color: ['#ebc9eb', '#FFFFFF'], district: '강남구', date: '2026-01-30' },
    { id: '6', name: '카페 드 파리',   color: ['#c9ebeb', '#FFFFFF'], district: '서초구', date: '2026-02-15' },
];

export default function PassportView() {
    const router = useRouter();
    // 장소별/위치별 탭 선택 상태
    const [selected, setSelected] = useState<'cover'| 'list'>('cover');
    // 돋보기 버튼 선택 상태
    const [searchSelected, setSearchSelected] = useState(false);

    return (
        
        <View style={styles.container}>
            {/* 빛 효과 */}
            <View style={styles.outerWrapper}>
                {/* 나의 여권 박스 */}
                <View style={styles.myContainer}>
                    <Text style={styles.myText}>나의 여권</Text>
                    <Text style={styles.recordText}>탐험 기록 3개</Text>
                    {/* 기록 컨테이너 */}
                    <View style={styles.recordContainer}>
                        {[
                            {label: '총 도장', value: 28},
                            {label: '방문한 곳', value: 28},
                            {label: '방문한 구', value: 5},
                        ].map((stat, i) => (
                            <React.Fragment key={i}>
                                {i !== 0 && <View style={styles.divider}/>}
                                <View style={styles.statItem}>
                                    <Text style={styles.myText}>{stat.value}</Text>
                                    <Text style={styles.statLabel}>{stat.label}</Text>
                                </View>
                            </React.Fragment>
                        ))}
                    </View>
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
                    <Text style={{ color: '#FFFFFF', fontSize: 23 }}>☰</Text>
                </TouchableOpacity> 
                
                {/* 검색 버튼 */}
                <TouchableOpacity
                    style={[styles.iconButton, searchSelected && styles.iconButtonActive] }
                    onPress={() => setSearchSelected(true)}
                >
                    <Ionicons name="search" size={25} color={colors.text.primary} />
                </TouchableOpacity> 
                </>
            )}
            </View>

            {/* 각 탭별 내용 */}
            {selected === 'cover' ? (
            <FlatList
                data={PLACES}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.gridContainer}
                columnWrapperStyle={styles.gridRow}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => console.log(item.name)}>
                        <LinearGradient
                            colors={item.color}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 0, y: 1 }}
                            style={styles.passportCover}
                        >
                        <Text style={styles.placeName}>{item.district}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            />
            ) : (
            <Text>목록형 여권 화면 (개발 중)</Text>
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#090D57',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: StatusBar.currentHeight || 65,
    },

    outerWrapper: {
        width: '90%',
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#FDA162',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 10,
        elevation: 10,
    },  

    myContainer: {
        width: '100%',
        height: 195,
        backgroundColor: '#060830',
        borderColor: '#FDA16270',
        borderWidth: 2,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },

    myText: {
        color: '#FDA162',
        fontSize: 24,
        fontWeight: 'bold',
    },

    recordText: {
        color: '#FDA162',
        fontSize: 13,
        marginTop: 10,
    },

    recordContainer: {
        width: '100%',
        height: 80,
        backgroundColor: '#F1E9E220',
        borderRadius: 15,
        marginTop: 15,
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 8,
    },

    statItem: {
        flex: 1,
        alignItems: 'center',
    },

    statLabel: {
        color: '#8888BB',
        fontSize: 11,
        marginTop: 4,
    },

    divider: {
        width: 1,
        backgroundColor: '#4A4B80',
        marginVertical: 4,
    },

    tabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
        gap: 8,
        paddingTop: 0,
        marginTop: 20,
    },
    
    tabButton: {
        width: 130,
        height: 39,
        alignItems: 'center',
        justifyContent: 'center',

        paddingVertical: 0,
        paddingHorizontal: 16,

        borderRadius: 10,
        backgroundColor: '#060830',
        borderWidth: 2,
        borderColor: '#FDA16270',

        shadowColor: '#FDA162',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 4,
    },

    tabButtonActive: {
        backgroundColor: '#FDA162',
        borderColor: '#FDA16270',

        shadowColor: '#FDA162',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 4,
    },

    tabText: {
        color: '#8888BB',
        fontSize: 16,
        fontWeight: 'bold',

        // 안드로이드 폰트 패딩 문제 해결
        includeFontPadding: false,
        textAlignVertical: 'center'
    },

    tabTextActive: {
        color: '#000000',
        fontWeight: 'bold',

        // 안드로이드 폰트 패딩 문제 해결
        includeFontPadding: false,
        textAlignVertical: 'center'
    },

    iconButton: {
        width: 39,
        height: 39,
        borderRadius: 10,
        backgroundColor: '#060830',
        borderWidth: 2,
        borderColor: '#FDA16270',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FDA162',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 4,
    },

    iconButtonActive: {
        width: 39,
        height: 39,
        backgroundColor: '#FDA162',
        shadowColor: '#FDA162',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 4,
    },

    searchInput: {
        width: Dimensions.get('window').width - 90,
        height: 39,
        backgroundColor: '#FDA162',

        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#FDA16270',

        paddingVertical: 8,
        paddingHorizontal: 16,
        fontSize: 14,
        fontWeight: 'bold',

        shadowColor: '#FDA162',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 4,
    },

    gridContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },

    gridRow: {
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 16,
    },

    passportCover: {
        width: (Dimensions.get('window').width - 16 * 2 - 36) / 2,
        height: (Dimensions.get('window').width - 16 * 2 - 36) / 2 * 1.29,
        borderTopRightRadius: 15,
        borderBottomRightRadius: 15,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 30,
        overflow: 'hidden',
    },

    placeName: {
        color: '#FFFFFF',
        fontSize: 20,
        fontStyle: 'italic',
        fontWeight: '600',
    },

});