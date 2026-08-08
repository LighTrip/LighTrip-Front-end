import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native';
import React from 'react'
import { passportStyles as styles, LIST_STAMP_SIZE, LIST_STAMP_ICON_SIZE } from './passportStyles';
import { MyPassport, getPassportDetail } from '@/src/api/passport/passport.api'

const STAMP_MAP: Record<string, any> = {
    'CAFE': require('@/assets/stamps/cafe.png'),
    'RESTAURANT': require('@/assets/stamps/restaurant.png'),
    'BAR': require('@/assets/stamps/bar.png'),
    'NATURE': require('@/assets/stamps/park.png'),
    'CULTURE': require('@/assets/stamps/culture.png'),
    'ACTIVITY': require('@/assets/stamps/fitness.png'),
    'SHOPPING': require('@/assets/stamps/shopping.png'),
    'ETC': require('@/assets/stamps/etc.png'),
}

export type Place = MyPassport

type Props = {
    data: MyPassport[]
    onSelectPlace?: (item: MyPassport) => void
}

const PlaceListView = ({ data, onSelectPlace }: Props) => {

    const handleSelect = async (item: MyPassport) => {
        try {
            const res = await getPassportDetail(item.passportId)
            onSelectPlace?.(res.data.data)  // 상세 데이터로 넘기기
        } catch (e) {
            console.error(e)
            onSelectPlace?.(item)  // 실패하면 기존 데이터로 fallback
        }
    }

    return (
        <View style={{ flex: 1, marginTop: 5, paddingBottom: 66 }}>

            <FlatList
                data={data}
                keyExtractor={(item) => item.passportId.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 60 }}>
                        <Text style={{ color: '#aaa', fontSize: 15 }}>아직 등록된 장소가 없어요 🗺️</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.listCard} onPress={() => handleSelect(item)}>
                        <Image 
                            source={STAMP_MAP[item.category] ?? STAMP_MAP['ETC']} 
                            style={{ width: LIST_STAMP_ICON_SIZE, height: LIST_STAMP_ICON_SIZE, marginLeft: 12 }}
                            resizeMode="contain"
                        />
                        <View style={styles.textArea}>
                            <Text style={styles.listName}>{item.spaceName}</Text>
                            <View style={styles.metaRow}>
                                <Image 
                                    source={require('@/assets/icons/location.png')} 
                                    style={{ width: 14, height: 14 }} 
                                    resizeMode="contain"
                                />
                                <Text style={styles.metaLocation}>{item.districtDisplayName}</Text>
                                <Image 
                                    source={require('@/assets/icons/calendar.png')} 
                                    style={{ width: 14, height: 14, }} 
                                    resizeMode="contain"
                                />
                                <Text style={styles.metaDate}> {item.visitedAt}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    )
}

export default PlaceListView
