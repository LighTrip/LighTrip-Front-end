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
import { Ionicons } from "@expo/vector-icons";

import { getMyPassportStats, getPassportDetail, getMyPassportDistricts } from '@/src/api/passport/passport.api'
import { useTeamMode } from '@/src/components/common/TeamModeContext'
import { subscribePassportTabPress } from '../passportTabBus'


export default function PassportView() {
    const router = useRouter();
    const { isTeamMode, teamId, teamName } = useTeamMode()

    const [selectedPlaces, setSelectedPlaces] = useState<any[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [activeTab, setActiveTab] = useState<'passport' | 'like' | 'scrap'>('passport');
    const [passportTab, setPassportTab] = useState<'cover' | 'list'>('cover')

    // 여권 통계 조회 연결
    const [stats, setStats] = useState({ passportCount: 0, likeCount: 0, scrapCount: 0 })
    const [districts, setDistricts] = useState<any[]>([])
    const [listRefreshKey, setListRefreshKey] = useState(0)

    const isTeamModeRef = useRef(isTeamMode)
    const teamIdRef = useRef(teamId)
    isTeamModeRef.current = isTeamMode
    teamIdRef.current = teamId

    const refetchStats = () => {
        const tid = isTeamModeRef.current ? teamIdRef.current ?? undefined : undefined
        getMyPassportStats(tid).then(res => setStats(res.data.data)).catch(console.error)
        getMyPassportDistricts(tid).then(res => setDistricts(res.data.data)).catch(console.error)
    }

    useFocusEffect(
        React.useCallback(() => {
            refetchStats()
        }, [])
    )

    React.useEffect(() => {
        refetchStats()
        setListRefreshKey(k => k + 1)
        if (isTeamMode) setActiveTab('passport')
    }, [isTeamMode, teamId])


    const selectedPlacesRef = useRef<any[]>([])
    const selectedIndexRef = useRef(0)

    const updateSelectedPlaces = (places: any[]) => {
        selectedPlacesRef.current = places
        setSelectedPlaces(places)
    }

    // 여권 탭을 다시 누르면 상세 화면에서 여권 탭 메인으로 복귀
    React.useEffect(() => {
        return subscribePassportTabPress(() => {
            if (selectedPlacesRef.current.length === 0) return
            updateSelectedPlaces([])
            setSelectedIndex(0)
            selectedIndexRef.current = 0
            setActiveTab('passport')
            refetchStats()
            setListRefreshKey(k => k + 1)
        })
    }, [])

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
                        key={selectedPlaces[selectedIndex]?.passportId}
                        item={selectedPlaces[selectedIndex]}
                        districts={districts}
                        sourceLabel={activeTab === 'like' ? '좋아요' : activeTab === 'scrap' ? '스크랩' : undefined}
                        onBack={() => {
                            updateSelectedPlaces([])
                            setSelectedIndex(0)
                            selectedIndexRef.current = 0
                            setActiveTab('passport')
                            refetchStats()
                            setListRefreshKey(k => k + 1)
                        }}
                        onPrev={selectedIndex > 0 ? () => changePage(selectedIndex - 1) : undefined}
                        onNext={selectedIndex < selectedPlaces.length - 1 ? () => changePage(selectedIndex + 1) : undefined}
                    />
                </View>
            ) : (
                <>
                    <Text style={styles.title}>{isTeamMode ? '팀 여권' : '나의 여권'}</Text>

                    {isTeamMode ? (
                        <View style={styles.teamNameCard}>
                            <View style={styles.teamNameGroup}>
                                <Text style={styles.teamCardLabel}>TEAM</Text>
                                <Text style={styles.teamNameText}>{teamName ?? '팀'}</Text>
                            </View>
                            <View style={styles.centerGroup}>
                                <View style={styles.dotLine}>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <View key={i} style={styles.dot} />
                                    ))}
                                </View>
                                <Ionicons name="airplane-sharp" size={30} color="#FFFFFF" />
                                <View style={styles.dotLine}>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <View key={i} style={styles.dot} />
                                    ))}
                                </View>
                            </View>
                            <View style={styles.teamStatsGroup}>
                                <Text style={styles.teamCardLabel}>STAMPS</Text>
                                <Text style={styles.teamStatsText}>{stats?.passportCount ?? 0}</Text>
                            </View>
                        </View>
                    ) : (
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
                    )}

                    {activeTab === 'passport' && <PassportList
                        initialTab={passportTab}
                        onTabChange={setPassportTab}
                        refreshTrigger={listRefreshKey}
                        isTeamMode={isTeamMode}
                        teamId={isTeamMode ? teamId : null}
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
        justifyContent: 'center',
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
        borderWidth: 1,
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

    teamNameCard: {
        flexDirection: 'row',
        marginHorizontal: 17,
        marginVertical: 17,
        backgroundColor: '#1A3A6B',
        borderRadius: 10,
        width: '92%',
        height: '11%',
        paddingVertical: 12,
        alignItems: 'center',
    },

    centerGroup: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
    },

    teamNameGroup: {
        flex: 1,
        alignItems: 'center',
        paddingRight: 60,
    },

    teamStatsGroup: {
        flex: 1,
        alignItems: 'center',
    },

    teamCardLabel: {
        color: '#FFFFFF',
        fontSize: 10,
        opacity: 0.7,
        letterSpacing: 1.5,
        fontFamily: 'Freesentation-3Light',
    },

    teamNameText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Freesentation-3Light',
    },

    teamStatsText: {
        color: '#FFFFFF',
        fontSize: 19,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Freesentation-3Light',
    },

    dotLine: {
        flexDirection: 'row',
        width: 36,
        gap: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },

    dot: {
        width: 2,
        height: 2,
        borderRadius: 2,
        backgroundColor: '#FFFFFF',
        opacity: 0.6,
    },
});