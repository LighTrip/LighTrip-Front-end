import { useRouter } from "expo-router";
import React, { useState, useRef } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    StatusBar,
} from 'react-native';

import PassportList from "../components/PassportList";
import LikeList from "../components/LikeList";
import ScrapList from "../components/ScrapList";
import PassportDetail from "./PassportDetail";

export default function PassportView() {
    const router = useRouter();

    const [selectedPlaces, setSelectedPlaces] = useState<any[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [activeTab, setActiveTab] = useState<'passport' | 'like' | 'scrap'>('passport');

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

    return (
        <View style={styles.container}>
            
            {selectedPlaces.length > 0 ? (
                <View style={{ flex: 1 }}>
                    <PassportDetail
                        item={selectedPlaces[selectedIndex]}
                        onBack={() => {
                            updateSelectedPlaces([])
                            setSelectedIndex(0)
                            selectedIndexRef.current = 0
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
                            <Text style={[styles.numText, activeTab === 'passport' && styles.numTextActive]}>26</Text>
                            <Text style={[styles.statText, activeTab === 'passport' && styles.statTextActive]}>여권</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.statCard, activeTab === 'like' && styles.statCardActive]} onPress={() => setActiveTab('like')}>
                            <Text style={[styles.numText, activeTab === 'like' && styles.numTextActive]}>18</Text>
                            <Text style={[styles.statText, activeTab === 'like' && styles.statTextActive]}>좋아요</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.statCard, activeTab === 'scrap' && styles.statCardActive]} onPress={() => setActiveTab('scrap')}>
                            <Text style={[styles.numText, activeTab === 'scrap' && styles.numTextActive]}>7</Text>
                            <Text style={[styles.statText, activeTab === 'scrap' && styles.statTextActive]}>스크랩</Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'passport' && <PassportList onSelectPlace={(item, group) => {
                        updateSelectedPlaces(group || [item])
                        const idx = group ? group.indexOf(item) : 0
                        selectedIndexRef.current = idx
                        setSelectedIndex(idx)
                    }} />}
                    {activeTab === 'like' && <LikeList />}
                    {activeTab === 'scrap' && <ScrapList />}
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
        paddingTop: StatusBar.currentHeight || 65,
    },

    title: {
        color: '#000000',
        fontSize: 24,
        textAlign: 'left',
        fontWeight: 'bold',
        marginBottom: 5,
        marginLeft: 20,
        marginTop: 10,
    },

    tabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 10,
        gap: 18,
        paddingTop: 0,
        marginTop: 10,
    },
    
    statCard: {
        width: Dimensions.get('window').width - 297,
        height: 80,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#1A3A6B',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 4,
    },

    statCardActive: {
        width: Dimensions.get('window').width - 297,
        height: 80,
        backgroundColor: '#1A3A6B',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#1A3A6B',
        alignItems: 'center',
        justifyContent: 'center',
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