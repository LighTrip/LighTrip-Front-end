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

const styles = StyleSheet.create({
    searchRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginHorizontal: 15,
        gap: 5,
        marginTop: 5,
        marginLeft: 20,
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
    textArea: { flex: 1 },
    metaRow: { flexDirection: 'row', gap: 24 },
    meta: { color: '#000000', fontSize: 14, fontWeight: '500' },
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
    dropdownText: { fontSize: 14, color: '#000' },
})