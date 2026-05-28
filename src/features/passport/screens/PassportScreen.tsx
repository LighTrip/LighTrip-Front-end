import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useRef } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
} from 'react-native';

import PassportList from "../components/PassportList";
import LikeList from "../components/LikeList";
import ScrapList from "../components/ScrapList";
import PassportDetail from "./PassportDetail";

import { getMyPassportStats, getPassportDetail, getMyPassportDistricts } from '@/src/api/passport/passport.api'


export default function PassportView() {
    const router = useRouter();

    const [selectedPlaces, setSelectedPlaces] = useState<any[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [activeTab, setActiveTab] = useState<'passport' | 'like' | 'scrap'>('passport');
    const [passportTab, setPassportTab] = useState<'cover' | 'list'>('cover')

    // 여권 통계 조회 연결
    const [stats, setStats] = useState({ passportCount: 0, likeCount: 0, scrapCount: 0 })
    const [districts, setDistricts] = useState<any[]>([])

    useFocusEffect(
        React.useCallback(() => {
            getMyPassportStats().then(res => setStats(res.data.data)).catch(console.error)
            getMyPassportDistricts().then(res => setDistricts(res.data.data)).catch(console.error)
        }, [])
    )


    const selectedPlacesRef = useRef<any[]>([])
    const selectedIndexRef = useRef(0)

    const updateSelectedPlaces = (places: any[]) => {
        selectedPlacesRef.current = places
        setSelectedPlaces(places)
    }

    const changePage = (newIndex: number) => {
        if (newIndex < 0 || newIndex >= selectedPlacesRef.current.length) return
        selectedIndexRef.current = newIndex
        setSelectedIndex(newIndex)
    }

    const handleSelectLikeOrScrap = async (passportId: number) => {
        try {
            const res = await getPassportDetail(passportId)
            updateSelectedPlaces([res.data.data])
            setSelectedIndex(0)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <View style={styles.container}>
            
            {selectedPlaces.length > 0 ? (
                <View style={{ flex: 1 }}>
                    <PassportDetail
                        item={selectedPlaces[selectedIndex]}
                        districts={districts}
                        onBack={() => {
                            updateSelectedPlaces([])
                            setSelectedIndex(0)
                            selectedIndexRef.current = 0
                            setActiveTab('passport')
                        }}
                        onPrev={selectedIndex > 0 ? () => changePage(selectedIndex - 1) : undefined}
                        onNext={selectedIndex < selectedPlaces.length - 1 ? () => changePage(selectedIndex + 1) : undefined}
                    />
                </View>
            ) : (
                <>
                    <Text style={styles.title}>나의 여권</Text>

                    <View style={styles.tabRow}>
                        <TouchableOpacity style={[styles.statCard, activeTab === 'passport' && styles.statCardActive]} onPress={() => setActiveTab('passport')}>
                            <Text style={[styles.numText, activeTab === 'passport' && styles.numTextActive]}>{stats?.passportCount ?? 0}</Text>
                            <Text style={[styles.statText, activeTab === 'passport' && styles.statTextActive]}>여권</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.statCard, activeTab === 'like' && styles.statCardActive]} onPress={() => setActiveTab('like')}>
                            <Text style={[styles.numText, activeTab === 'like' && styles.numTextActive]}>{stats?.likeCount ?? 0}</Text>
                            <Text style={[styles.statText, activeTab === 'like' && styles.statTextActive]}>좋아요</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.statCard, activeTab === 'scrap' && styles.statCardActive]} onPress={() => setActiveTab('scrap')}>
                            <Text style={[styles.numText, activeTab === 'scrap' && styles.numTextActive]}>{stats?.scrapCount ?? 0}</Text>
                            <Text style={[styles.statText, activeTab === 'scrap' && styles.statTextActive]}>스크랩</Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'passport' && <PassportList 
                        initialTab={passportTab}
                        onTabChange={setPassportTab}
                        onSelectPlace={(item, group) => {
                            updateSelectedPlaces(group || [item])
                            const idx = group ? group.indexOf(item) : 0
                            selectedIndexRef.current = idx
                            setSelectedIndex(idx)
                        }} />
                    }
                    {activeTab === 'like' && (
                        <LikeList onSelectPlace={(item) => handleSelectLikeOrScrap(item.passportId)} />
                    )}
                    {activeTab === 'scrap' && (
                        <ScrapList onSelectPlace={(item) => handleSelectLikeOrScrap(item.passportId)} />
                    )}      
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFD',
        justifyContent: 'flex-start',
        paddingTop: StatusBar.currentHeight || 50,
    },

    title: {
        position: "fixed",
        color: '#000000',
        fontSize: 24,
        textAlign: 'left',
        fontWeight: 'bold',
        marginLeft: 20,
        marginTop: 10,
    },

    tabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: -50,
        marginHorizontal: 20,
        gap: 10,
    },
    
    statCard: {
        position: "fixed",
        width: '32%',
        height: '40%',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#1A3A6B',
        alignItems: 'center',
        justifyContent: 'center',
    },

    statCardActive: {
        width: '32%',
        height: '40%',
        backgroundColor: '#1A3A6B',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#1A3A6B',
        alignItems: 'center',
        justifyContent: 'center',
    },

    tabButton: {
        position: "fixed",
        width: '30%',
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
        textAlignVertical: 'center'
    },

    numText: {
        color: '#000000',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    numTextActive: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    statText: {
        color: '#000000',
        fontSize: 14,
        textAlign: 'center',
    },

    statTextActive: {
        color: '#FFFFFF',
        fontSize: 14,
        textAlign: 'center',
    },
});