import { 
    StatusBar, 
    StyleSheet, 
    Text, 
    View, 
    TouchableOpacity, 
    Image, 
    Dimensions,
    TextInput,
    Modal,
    FlatList,
    Platform,
    KeyboardAvoidingView,
    Alert,
} from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import KakaoPlaceSearch from '@/src/components/passport/KakaoPlaceSearch'
import MusicSearch from '@/src/components/passport/MusicSearch'
import * as ImagePicker from 'expo-image-picker'

import NoiseOverlay from '@/src/components/common/NoiseOverlay'
import DatePickerModal from '@/src/components/passport/DatePickerModal'

// API
import { 
    deletePassport, 
    updatePassport, 
    updatePassportVisibility, 
    PassportCategory, 
    Visibility, 
} from '@/src/api/passport/passport.api'

type Props = {
    item: any
    districts?: any[]
    onBack: () => void
    onNext?: () => void
    onPrev?: () => void
}

const STAMP_MAP: Record<string, any> = {
    '☕ 카페': require('@/assets/stamps/cafe.png'),
    '🍽️ 식당': require('@/assets/stamps/restaurant.png'),
    '🍶 술집': require('@/assets/stamps/bar.png'),
    '🏞️ 공원': require('@/assets/stamps/park.png'),
    '🎬 문화': require('@/assets/stamps/culture.png'),
    '🏋️ 운동': require('@/assets/stamps/fitness.png'),
    '🛍️ 쇼핑': require('@/assets/stamps/shopping.png'),
    '📦 기타': require('@/assets/stamps/etc.png'),
}

const CATEGORY_TO_KOREAN: Record<string, string> = {
    'CAFE': '☕ 카페',
    'RESTAURANT': '🍽️ 식당',
    'BAR': '🍶 술집',
    'NATURE': '🏞️ 공원',
    'CULTURE': '🎬 문화',
    'ACTIVITY': '🏋️ 운동',
    'SHOPPING': '🛍️ 쇼핑',
    'ETC': '📦 기타',
}

const PLACE_TYPES = ['☕ 카페', '🍽️ 식당', '🍶 술집', '🏞️ 공원', '🎬 문화', '🏋️ 운동', '🛍️ 쇼핑', '📦 기타']

const { width } = Dimensions.get('window')

const PassportDetail = ({ item, onBack, onNext, onPrev, districts }: Props) => {
    console.log('item 전체:', JSON.stringify(item))

    const [isEditing, setIsEditing] = useState(false)
    const [editReview, setEditReview] = useState(item.content ?? '')
    const [editCategory, setEditCategory] = useState(CATEGORY_TO_KOREAN[item.category] ?? '선택')            
    const [editDate, setEditDate] = useState(new Date(item.visitedAt))
    const [editImageUri, setEditImageUri] = useState<string | null>(null)
    const [editMusic, setEditMusic] = useState<{ title: string, artist: string, artwork: string } | null>(null)
    const [musicArtwork, setMusicArtwork] = useState<string | null>(null)

    const [isCover, setIsCover] = useState(false)
    const [isPublic, setIsPublic] = useState(true)
    const [editSpaceName, setEditSpaceName] = useState(item.spaceName ?? '')
    const [placeSearchOpen, setPlaceSearchOpen] = useState(false)
    const districtCount = districts?.find(d => d.displayName === item.district)?.passportCount ?? 0

    useEffect(() => {
        if (item.musicTitle && item.musicArtist) {
            fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(item.musicTitle + ' ' + item.musicArtist)}&media=music&limit=1`)
                .then(res => res.json())
                .then(data => {
                    const artwork = data.results?.[0]?.artworkUrl100
                    if (artwork) setMusicArtwork(artwork)
                })
                .catch(() => {})
        }
    }, [item.musicTitle, item.musicArtist])

    const handleDelete = async () => {
        Alert.alert(
            '여권 삭제',
            '해당 여권을 삭제하시겠습니까?',
            [
                { text: '아니오', style: 'cancel' },
                {
                    text: '네',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deletePassport(Number(item.passportId))
                            onBack()
                        } catch (e) {
                            console.error(e)
                        }
                    }
                }
            ]
        )
    }

    const openImagePicker = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!permission.granted) return alert('앨범 접근 권한이 필요해요')

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
        })

        if (!result.canceled) {
            setEditImageUri(result.assets[0].uri)
        }
    }
        
    const handleSave = async () => {
        try {
            const updateData = {
                content: editReview,
                visitedAt: editDate.toISOString().split('T')[0],
                category: Object.keys(CATEGORY_TO_KOREAN).find(
                    key => CATEGORY_TO_KOREAN[key] === editCategory
                ) as PassportCategory | undefined,
                musicTitle: editMusic?.title ?? item.musicTitle,
                musicArtist: editMusic?.artist ?? item.musicArtist,  
                imageUrls: item.imageUrls ?? [],
                districtCategory: item.districtCategory,
                visibility: (isPublic ? 'PUBLIC' : 'PRIVATE') as Visibility,
                spaceName: editSpaceName,
            }
            const res = await updatePassport(item.passportId, updateData)
            const updated = res.data.data

            await updatePassportVisibility(item.passportId, isPublic ? 'PUBLIC' : 'PRIVATE')
            setIsEditing(false)
        } catch (e: any) {
            console.error('저장 실패:', e.response?.data)
        }
    }

    const [musicModalOpen, setMusicModalOpen] = useState(false)
    const [categoryOpen, setCategoryOpen] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState(false)

    const formatDate = (date: Date) => {
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
    }

    return (
        <KeyboardAvoidingView 
            style={[styles.container, styles.scrollContent]} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >

            {/* 상단 헤더 */}
            <View style={styles.headerCard}>
                <View style={{ borderRadius: 16, overflow: 'hidden', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <NoiseOverlay />
                </View>
                <Text style={styles.districtTitle}>{item.district}</Text>
                <Text style={styles.visitText}>{item.district}를 {districtCount}번 탐험했어요 ♪</Text>
            </View>

            {/* 여권 카드 */}
            <View style={styles.passportCard}>
                <View style={{ borderRadius: 16, overflow: 'hidden', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <NoiseOverlay />
                </View>

                {/* 윗부분 */}
                <View style={styles.topHalf}>
                    <TouchableOpacity onPress={onBack} style={styles.closeButton}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>

                    <Image source={require('../../../../assets/images/pinktape.png')} style={styles.tape} resizeMode="contain" />
                    
               <View>
                    <TouchableOpacity onPress={isEditing ? openImagePicker : undefined} disabled={!isEditing}>
                        <View style={styles.imageBackground} />
                        <Image 
                            source={{ uri: editImageUri ?? item.imageUrls?.[0] ?? item.image?.uri }} 
                            style={styles.placeImage} 
                            resizeMode="cover" 
                        />
                        {isEditing && (
                            <View style={styles.editImageBadge}>
                                <Ionicons name="camera-outline" size={14} color="#000000" />
                            </View>
                        )}
                    </TouchableOpacity>
                    {isEditing && (
                        <TouchableOpacity 
                            style={styles.coverBadge}
                            onPress={() => setIsCover(!isCover)}
                        >
                            <Ionicons 
                                name={isCover ? 'bookmark' : 'bookmark-outline'} 
                                size={14} 
                                color="#ffffff" 
                            />
                            <Text style={styles.coverBadgeText}>
                                {isCover ? '대표 사진' : '대표 사진으로 설정'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                    <Image
                        source={STAMP_MAP[editCategory] ?? STAMP_MAP['📦 기타']}
                        style={styles.stampImage}
                        resizeMode="contain"
                    />

                    {/* 정보 */}
                    <View style={styles.infoArea}>
                        {/* 카테고리 */}
                        <View style={styles.infoRow}>
                            {isEditing ? (
                                <TouchableOpacity onPress={() => setCategoryOpen(true)} style={styles.infoEditButton}>
                                    <Text style={styles.infoText}>{editCategory}</Text>
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.infoText}>{editCategory}</Text>
                            )}
                        </View>

                        {/* 위치 */}
                        <View style={styles.infoRow}>
                            <Image source={require('../../../../assets/icons/location.png')} style={styles.icon} resizeMode="contain"/>
                            {isEditing ? (
                                <TouchableOpacity onPress={() => setPlaceSearchOpen(true)} style={styles.infoEditButton}>
                                    <Text style={styles.infoText}>{editSpaceName}</Text>
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.infoText}>{editSpaceName}</Text>
                            )}
                        </View>

                        {/* 날짜 */}
                        <View style={styles.infoRow}>
                            <Image source={require('../../../../assets/icons/calendar.png')} style={styles.icon} resizeMode="contain"/>
                            {isEditing ? (
                                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.infoEditButton}>
                                    <Text style={styles.infoText}>{formatDate(editDate)}</Text>
                                </TouchableOpacity>
                            ) : (
                                    <Text style={styles.infoText}>{formatDate(editDate)}</Text>
                            )}
                        </View>

                        <DatePickerModal
                            visible={showDatePicker}
                            date={editDate}
                            onChange={(newDate) => setEditDate(newDate)}
                            onClose={() => setShowDatePicker(false)}
                        />
                    </View>
                </View>

                {/* 구분선 */}
                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                </View>

                {/* 아랫부분 */}
                <View style={styles.bottomHalf}>

                    {/* 리뷰 */}
                    <View style={styles.reviewBox}>
                        {isEditing ? (
                            <TextInput
                                style={styles.editReviewInput}
                                multiline
                                value={editReview}
                                onChangeText={setEditReview}
                                placeholderTextColor="#aaa"
                            />
                        ) : (
                            <Text style={styles.reviewText}>{editReview}</Text>
                        )}
                    </View>

                    {/* 음악 */}
                    {isEditing ? (
                        <TouchableOpacity style={styles.musicBox} onPress={() => setMusicModalOpen(true)}>
                            {editMusic ? (
                            <>
                                <Image source={{ uri: editMusic.artwork }} style={styles.musicImage} />
                                <View>
                                    <Text style={styles.musicTitle}>{editMusic.title}</Text>
                                    <Text style={styles.artist}>{editMusic.artist}</Text>
                                </View>
                            </>
                        ) : item.musicTitle ? (
                            <>
                                {musicArtwork ? (
                                    <Image source={{ uri: musicArtwork }} style={styles.musicImage} />
                                ) : (
                                    <View style={[styles.musicImage, { backgroundColor: '#ddd' }]} />
                                )}
                                <View>
                                    <Text style={styles.musicTitle}>{item.musicTitle}</Text>
                                    <Text style={styles.artist}>{item.musicArtist}</Text>
                                </View>
                            </>
                        ) : (
                            <View style={{ marginLeft: 20 }}>
                                <Text style={styles.musicTitle}>음악 없음</Text>
                            </View>
                        )}
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.musicBox}>
                            {editMusic ? (
                                <>
                                    <Image source={{ uri: editMusic.artwork }} style={styles.musicImage} />
                                    <View>
                                        <Text style={styles.musicTitle}>{editMusic.title}</Text>
                                        <Text style={styles.artist}>{editMusic.artist}</Text>
                                    </View>
                                </>
                            ) : item.musicTitle ? (
                                <>
                                    {musicArtwork ? (
                                        <Image source={{ uri: musicArtwork }} style={styles.musicImage} />
                                    ) : (
                                        <View style={[styles.musicImage, { backgroundColor: '#ddd' }]} />
                                    )}
                                    <View>
                                        <Text style={styles.musicTitle}>{item.musicTitle}</Text>
                                        <Text style={styles.artist}>{item.musicArtist}</Text>
                                    </View>
                                </>
                            ) : (
                                <View style={{ marginLeft: 20 }}>
                                    <Text style={styles.musicTitle}>음악 없음</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* edit / save 버튼 */}
                    <View style={styles.editBox}>
                        {isEditing ? (
                            <>
                                <TouchableOpacity onPress={handleDelete}>
                                    <Text style={styles.editText}>삭제</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSave}>
                                    <Text style={styles.editText}>save my passport</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setIsPublic(!isPublic)}>
                                    <Text style={styles.editText}>{isPublic ? '공개' : '비공개'}</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity onPress={onPrev}>
                                    <Text style={styles.editText}>{'< < < < < < < < < < <'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setIsEditing(true)}>
                                    <Text style={styles.editText}>edit my passport</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onNext}>
                                    <Text style={styles.editText}>{'> > > > > > > > > > >'}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                </View>
            </View>

            {/* 카테고리 모달 */}
            <Modal visible={categoryOpen} transparent animationType="fade" onRequestClose={() => setCategoryOpen(false)}>
                <TouchableOpacity style={styles.modalBackdrop} onPress={() => setCategoryOpen(false)} activeOpacity={1}>
                    <View style={styles.modalBox}>
                        <FlatList
                            data={PLACE_TYPES}
                            keyExtractor={(i) => i}
                            renderItem={({ item: option }) => (
                                <TouchableOpacity
                                    style={[styles.modalItem, option === editCategory && styles.modalItemSelected]}
                                    onPress={() => { setEditCategory(option); setCategoryOpen(false) }}
                                >
                                    <Text style={[styles.modalItemText, option === editCategory && styles.modalItemTextSelected]}>{option}</Text>
                                    {option === editCategory && <Ionicons name="checkmark" size={16} color="#1A3A6B" />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            <MusicSearch
                visible={musicModalOpen}
                onSelect={(item) => setEditMusic(item)}
                onClose={() => setMusicModalOpen(false)}
            />

            <KakaoPlaceSearch
                visible={placeSearchOpen}
                onSelect={(place) => setEditSpaceName(place.place_name)}
                onClose={() => setPlaceSearchOpen(false)}
            />

        </KeyboardAvoidingView>
    )
}

export default PassportDetail

const styles = StyleSheet.create({
    container: {
        width: Dimensions.get('window').width,
        flex: 1,
        backgroundColor: '#F8FAFD',
    },

    noiseOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 1,
    },

    scrollContent: {
        padding: 16,
        gap: 16,
        paddingBottom: 40,
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
    },

    headerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginTop: -20,
        // overflow: 'hidden',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },

    districtTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 6,
    },

    visitText: {
        fontSize: 14,
        color: '#888',
    },

    passportCard: {
        height: '77%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        // overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
        paddingBottom: 20,
    },

    topHalf: {
        padding: 20,
        paddingTop: 30,
        minHeight: 280,
        justifyContent: 'flex-start',
    },

    bottomHalf: {
        padding: 20,
        flex: 1,
        flexDirection: 'column',
        gap: 16,
    },

    closeButton: {
        position: 'absolute',
        top: 12,
        right: 16,
        zIndex: 10,
    },

    closeText: {
        fontSize: 18,
        color: '#1A3A6B',
        fontWeight: 'bold',
    },

    tape: {
        position: 'absolute',
        top: 30,
        left: width * 0.27,
        width: 110,
        height: 70,
        zIndex: 5,
    },

    imageBackground: {
        position: 'absolute',
        width: '55%',      
        height: 260,        
        left: 0,
        top: 5,
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        transform: [{ rotate: '-4deg' }],
    },

    placeImage: {
        width: '50%',
        height: 240,
        left: 8,
        borderRadius: 4,
        transform: [{ rotate: '-4deg' }],
        marginBottom: 10,
        marginTop: 10,
        top: 5,
    },

    editImageBadge: {
        position: 'absolute',
        bottom: 5,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff80',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
    },

    coverBadge: {
        position: 'absolute',
        bottom: 260,
        left: -10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A3A6B',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
    },

    coverBadgeText: {
        fontSize: 11,
        color: '#ffffff',
        fontWeight: '600',
    },

    stampImage: {
        position: 'absolute',
        top: 20,
        right: 0,
        width: 180,
        height: 180,
    },

    infoArea: {
        position: 'absolute',
        bottom: 30,
        left: 120,
        gap: 2,
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        left: 105,
    },

    infoEditButton: {
        width: 110,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    infoText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'left',
        lineHeight: 28,
        fontFamily: 'Griun_Gellyroll',
    },

    icon: {
        width: 16,
        height: 16,
    },

    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    dividerLine: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },

    reviewBox: {
        width: '100%',
        minHeight: 130,
        borderRadius: 12,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },

    reviewText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        lineHeight: 28,
        width: '95%',
        fontFamily: 'Griun_Gellyroll',
    },

    editReviewInput: {
        width: '102%',
        height: 120,
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 12,
        fontSize: 16,
        lineHeight: 28,
        alignContent: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        fontFamily: 'Griun_Gellyroll',
    },

    musicBox: {
        flexDirection: 'row',
        height: 80,
        width: '100%',
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#ffffff',
    },

    musicImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginLeft: 20,
    },

    musicTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
        marginLeft: 10,
    },

    artist: {
        fontSize: 13,
        color: '#888',
        marginLeft: 10,
    },

    coverRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingHorizontal: 4,
    },

    coverTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#222',
    },

    coverSub: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },

    editBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        bottom: 3,
        gap: 5,
    },

    editText: {
        width: 110,
        height: 20,
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: 10,
        color: '#757575',
        fontFamily: 'Moneygraphy',
    },

    modalBackdrop: {
        flex: 1,
        backgroundColor: '#00000040',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalBox: {
        width: 220,
        maxHeight: 350,
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 8,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },

    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    modalItemSelected: {
        backgroundColor: '#F0F4FF',
    },

    modalItemText: {
        fontSize: 14,
        color: '#333',
    },

    modalItemTextSelected: {
        color: '#1A3A6B',
        fontWeight: '600',
    },

    musicModalBox: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '70%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
    },

    musicSearchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
        marginBottom: 12,
    },

    musicSearchInput: {
        flex: 1,
        fontSize: 14,
        color: '#222',
    },

    musicResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    musicResultArt: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#ddd',
    },

    musicResultInfo: {
        flex: 1,
        gap: 4,
    },

    musicResultTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#222',
    },

    musicResultArtist: {
        fontSize: 12,
        color: '#888',
    },

    publicRow: {
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
        paddingVertical: 12,
        gap: 12,
        marginRight: 15,
    },

    publicTitle: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'right',
        color: '#222',
    },

    publicSub: {
        fontSize: 12,
        color: '#888',
    },

})