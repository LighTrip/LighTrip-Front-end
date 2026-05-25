import {
    View,
    Text,
    Image,
    TouchableOpacity,
    TextInput,
    FlatList,
} from 'react-native';
import React, { useState } from 'react'
import colors from '@/src/constant/colors';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import { passportStyles as styles } from './passportStyles';


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

    return (
        <View style={{ flex: 1 }}>
            
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
