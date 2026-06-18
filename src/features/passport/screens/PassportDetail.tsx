import KakaoPlaceSearch from '@/src/components/passport/KakaoPlaceSearch'
import MusicSearch from '@/src/components/passport/MusicSearch'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import React, { useEffect, useState } from 'react'
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
} from 'react-native'

import NoiseOverlay from '@/src/components/common/NoiseOverlay'
import DatePickerModal from '@/src/components/passport/DatePickerModal'

import {
    deletePassport,
    PassportCategory,
    updatePassport,
    createPassport,
    getPassportDetail,
    getMyPassportDistricts,
    CreatePassportRequest,
    changePassportVisibility,
    Visibility,
    CATEGORY_MAP,
    changeCoverImage,
    textColor,
} from '@/src/api/passport/passport.api'
import { DISTRICT_CATEGORY_MAP } from '@/src/constant/regions'
import { predictCoverTextColor } from '../cover_ai/coverColorHelper'
import { getMyPremium } from '@/src/api/payment/payment.api'

type Props = {
    item: any
    districts?: any[]
    onBack: () => void
    onNext?: () => void
    onPrev?: () => void
    editable?: boolean
    sourceLabel?: string
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

const TAPE_COLOR_MAP: Record<string, string> = {
    '☕ 카페': '#682709',
    '🍽️ 식당': '#b53426',
    '🍶 술집': '#5b2188',
    '🏞️ 공원': '#4b8215',
    '🎬 문화': '#ff6f00',
    '🏋️ 운동': '#173282',
    '🛍️ 쇼핑': '#ff01b7',
    '📦 기타': '#A8A8A8',
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

const VISIBILITY_CYCLE: Visibility[] = ['PUBLIC', 'FRIENDS_ONLY', 'PRIVATE']
const VISIBILITY_LABEL: Record<Visibility, string> = {
    PUBLIC: '공개',
    FRIENDS_ONLY: '친구만',
    PRIVATE: '비공개',
}

const { width, height: screenHeight } = Dimensions.get('window')

const THEME_COLORS = ['#F8FAFD', '#FFF0F5', '#FFF4EE', '#FFFBEE', '#EEFFF5']

const hexToRgb = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `${r},${g},${b}`
}

const rgbToHex = (rgb: string): string => {
    const [r, g, b] = rgb.split(',').map(Number)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase()
}

type MusicDisplayItem = { title: string; artist: string; artwork: string } | null

const MusicBox = ({ music, onPress, styles }: { music: MusicDisplayItem; onPress?: () => void; styles: any }) => {
    const content = music ? (
        <>
            {music.artwork ? (
                <Image source={{ uri: music.artwork }} style={styles.musicImage} />
            ) : (
                <View style={[styles.musicImage, { backgroundColor: '#ddd' }]} />
            )}
            <View>
                <Text style={styles.musicTitle}>{music.title}</Text>
                <Text style={styles.artist}>{music.artist}</Text>
            </View>
        </>
    ) : (
        <View style={{ marginLeft: 20 }}>
            <Text style={styles.musicTitle}>음악 없음</Text>
        </View>
    )

    return onPress ? (
        <TouchableOpacity style={styles.musicBox} onPress={onPress}>{content}</TouchableOpacity>
    ) : (
        <View style={styles.musicBox}>{content}</View>
    )
}

const PassportDetail = ({ item, onBack, onNext, onPrev, districts, editable = true, sourceLabel }: Props) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editReview, setEditReview] = useState(item.content ?? '')
    const [editCategory, setEditCategory] = useState(CATEGORY_TO_KOREAN[item.category] ?? '선택')
    const [editDate, setEditDate] = useState(new Date(item.visitedAt))
    const [editImageUri, setEditImageUri] = useState<string | null>(null)
    const [editMusic, setEditMusic] = useState<{ title: string; artist: string; artwork: string } | null>(null)
    const [musicArtwork, setMusicArtwork] = useState<string | null>(null)
    const [isCover, setIsCover] = useState(false)
    const [visibility, setVisibility] = useState<Visibility>(item.visibility ?? 'PUBLIC')
    const [editSpaceName, setEditSpaceName] = useState(item.spaceName ?? '')
    const [placeSearchOpen, setPlaceSearchOpen] = useState(false)
    const [musicModalOpen, setMusicModalOpen] = useState(false)
    const [categoryOpen, setCategoryOpen] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [editDistrict, setEditDistrict] = useState(item.district ?? item.districtDisplayName ?? '')
    const [editDistrictCategory, setEditDistrictCategory] = useState(item.districtCategory ?? '')
    const [editAddress, setEditAddress] = useState(item.address ?? '')
    const [editLat, setEditLat] = useState<number>(item.latitude ?? 0)
    const [editLng, setEditLng] = useState<number>(item.longitude ?? 0)
    const [isPremium, setIsPremium] = useState(false)
    const [themeColor, setThemeColor] = useState(
        item.theme ? rgbToHex(item.theme) : '#F8FAFD'
    )

    const districtCount = (item as any)._districtPassportCount ?? districts?.find(d => d.displayName === editDistrict)?.passportCount ?? 0

    const displayMusic: MusicDisplayItem = editMusic ?? (item.musicTitle ? {
        title: item.musicTitle,
        artist: item.musicArtist,
        artwork: musicArtwork ?? ''
    } : null)

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

    useEffect(() => {
        getMyPremium().then(res => {
            if (res.data?.data?.premium) setIsPremium(true)
        }).catch(() => {})
    }, [])

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
            const matchedDistrict = districts?.find(d => d.displayName === editDistrict)
            const originalDistrict = item.district ?? item.districtDisplayName ?? ''
            const isNewDistrict = editDistrict !== originalDistrict && !matchedDistrict

            const passportData: CreatePassportRequest = {
                content: editReview,
                visitedAt: editDate.toISOString().split('T')[0],
                category: CATEGORY_MAP[editCategory] as PassportCategory,
                musicTitle: editMusic?.title ?? item.musicTitle,
                musicArtist: editMusic?.artist ?? item.musicArtist,
                imageUrls: item.imageUrls ?? [],
                district: editDistrict,
                districtCategory: matchedDistrict?.districtCategory ?? DISTRICT_CATEGORY_MAP[editDistrict] ?? editDistrictCategory,
                spaceName: editSpaceName,
                visibility: visibility,
                address: editAddress,
                latitude: editLat,
                longitude: editLng,
                theme: isPremium ? hexToRgb(themeColor) : undefined,
            }

            if (isNewDistrict) {
                let imageUrls = item.imageUrls
                if (!imageUrls || imageUrls.length === 0) {
                    const detailRes = await getPassportDetail(item.passportId)
                    imageUrls = detailRes.data?.data?.imageUrls ?? []
                }
                await createPassport({ ...passportData, imageUrls })
                await deletePassport(item.passportId)
                onBack()
            } else {
                await updatePassport(item.passportId, passportData)
                await changePassportVisibility(item.passportId, visibility)
                if (editDistrict !== originalDistrict) {
                    onBack()
                } else {
                    setIsEditing(false)
                }
            }
        } catch (e: any) {
            const errData = e.response?.data
            console.error('저장 실패:', JSON.stringify(errData))
            Alert.alert('저장 실패', JSON.stringify(errData ?? e.message ?? '알 수 없는 오류'))
        }
    }

    const formatDate = (date: Date) => {
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
    }

    const handleSetCover = async () => {
        try {
            let coverId = item._coverId ?? item.coverId ?? null

            if (coverId == null) {
                const districtsRes = await getMyPassportDistricts()
                const allDistricts: any[] = districtsRes.data?.data ?? []
                const match = allDistricts.find(
                    (d: any) => d.districtCategory === editDistrictCategory || d.displayName === editDistrict
                )
                coverId = match?.coverId ?? null
            }

            if (coverId == null) {
                Alert.alert('설정 실패', '지역 커버 정보를 찾을 수 없어요.')
                return
            }

            let imageUrl: string | undefined = item.imageUrls?.[0]
            if (!imageUrl) {
                try {
                    const detailRes = await getPassportDetail(item.passportId)
                    imageUrl = detailRes.data?.data?.imageUrls?.[0]
                } catch (_) {}
            }
            if (!imageUrl) {
                Alert.alert('설정 실패', '사진이 없어요.')
                return
            }

            await changeCoverImage(coverId, imageUrl)

            const colorHex = await predictCoverTextColor(imageUrl, editDistrict)
            await textColor(coverId, colorHex)

            setIsCover(true)
            Alert.alert('대표 사진으로 설정되었습니다.')
        } catch (e: any) {
            console.error('대표 사진 설정 실패:', e.response?.data)
            Alert.alert('설정 실패', '잠시 후 다시 시도해 주세요.')
        }
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
                <Text style={styles.districtTitle}>{sourceLabel ?? editDistrict}</Text>
                {!sourceLabel && (
                    <Text style={styles.visitText}>{editDistrict}를 {districtCount}번 탐험했어요 ♪</Text>
                )}
            </View>

            {/* 여권 카드 */}
            <View style={styles.passportCard}>
                <View style={{ borderRadius: 16, overflow: 'hidden', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <NoiseOverlay />
                </View>
                {themeColor !== '#F8FAFD' && (
                    <View style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: themeColor,
                        opacity: 0.45,
                        borderRadius: 16,
                    }} />
                )}

                {/* 윗부분 */}
                <View style={styles.topHalf}>
                    <TouchableOpacity onPress={onBack} style={styles.closeButton}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>

                    <Image source={require('../../../../assets/images/pinktape.png')} 
                        style={[styles.tape, { tintColor: TAPE_COLOR_MAP[editCategory] ?? '#FFD9D9' }]}
                        resizeMode="contain"
                    />

                    <View>
                        <View style={styles.imageBackground} />
                        {item.imageUrls && item.imageUrls.length > 1 ? (
                            <View
                                style={{
                                    width: width * 0.41,
                                    height: 240,
                                    marginBottom: 10,
                                    marginTop: 10,
                                    top: 5,
                                    borderRadius: 4,
                                    overflow: 'hidden',
                                }}
                            >
                                <ScrollView
                                    horizontal
                                    pagingEnabled
                                    showsHorizontalScrollIndicator={false}
                                    decelerationRate="fast"
                                >
                                    {item.imageUrls.map((uri: string, idx: number) => (
                                        <Image
                                            key={idx}
                                            source={{ uri: idx === 0 ? (editImageUri ?? uri) : uri }}
                                            style={{ width: width * 0.41, height: 240 }}
                                            resizeMode="cover"
                                        />
                                    ))}
                                </ScrollView>

                                {isEditing && (
                                    <TouchableOpacity
                                        style={[styles.editImageBadge, { position: 'absolute', bottom: 5, left: 5 }]}
                                        onPress={openImagePicker}
                                    >
                                        <Ionicons name="camera-outline" size={14} color="#000000" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : isEditing ? (
                            <TouchableOpacity onPress={openImagePicker}>
                                <Image
                                    source={{ uri: editImageUri ?? item.imageUrls?.[0] ?? item.image?.uri }}
                                    style={styles.placeImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.editImageBadge}>
                                    <Ionicons name="camera-outline" size={14} color="#000000" />
                                </View>
                            </TouchableOpacity>
                        ) : (
                            <Image
                                source={{ uri: item.imageUrls?.[0] ?? item.image?.uri }}
                                style={styles.placeImage}
                                resizeMode="cover"
                            />
                        )}

                        {isEditing && (
                            <TouchableOpacity
                                style={styles.coverBadge}
                                onPress={handleSetCover}
                            >
                                <Ionicons
                                    name={isCover ? 'bookmark' : 'bookmark-outline'}
                                    size={10}
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
                        <View style={[styles.infoRow, { marginBottom: 2 }]}>
                            {isEditing ? (
                                <TouchableOpacity onPress={() => setCategoryOpen(true)} style={styles.infoEditButton}>
                                    <Text style={styles.infoText}>{editCategory}</Text>
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.infoText}>{editCategory}</Text>
                            )}
                        </View>

                        <View style={styles.infoRow}>
                            <Image source={require('../../../../assets/icons/location.png')} 
                                style={[styles.icon, { tintColor: TAPE_COLOR_MAP[editCategory] ?? '#FFD9D9' }]} 
                                resizeMode="contain" 
                            />
                            {isEditing ? (
                                <TouchableOpacity onPress={() => setPlaceSearchOpen(true)} style={styles.infoEditButton}>
                                    <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">
                                        {editSpaceName}
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">{editSpaceName}</Text>
                            )}
                        </View>

                        <View style={styles.infoRow}>
                            <Image source={require('../../../../assets/icons/calendar.png')} 
                                style={[styles.icon, { tintColor: TAPE_COLOR_MAP[editCategory] ?? '#FFD9D9' }]} 
                                resizeMode="contain" 
                            />
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

                        {isEditing && isPremium && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, top: 15, right: -90 }}>
                                {THEME_COLORS.map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        onPress={() => setThemeColor(color)}
                                        style={{
                                            width: 15,
                                            height: 15,
                                            borderRadius: 10,
                                            backgroundColor: color,
                                            borderWidth: themeColor === color ? 2 : 1,
                                            borderColor: themeColor === color ? '#1A3A6B' : '#ccc',
                                        }}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* 구분선 */}
                <View style={[styles.dividerRow, { position: 'absolute', top: '50%', left: 0, right: 0 }]}>
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
                    <MusicBox
                        music={displayMusic}
                        onPress={isEditing ? () => setMusicModalOpen(true) : undefined}
                        styles={styles}
                    />

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
                                <TouchableOpacity onPress={() => {
                                    const idx = VISIBILITY_CYCLE.indexOf(visibility)
                                    setVisibility(VISIBILITY_CYCLE[(idx + 1) % 3])
                                }}>
                                    <Text style={styles.editText}>{VISIBILITY_LABEL[visibility]}</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity onPress={onPrev}>
                                    <Text style={styles.editText}>{'< < < < < < < < < < <'}</Text>
                                </TouchableOpacity>
                                {editable && (
                                    <TouchableOpacity onPress={() => setIsEditing(true)}>
                                        <Text style={styles.editText}>edit my passport</Text>
                                    </TouchableOpacity>
                                )}
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
                onSelect={(item) => {
                    setEditMusic(item)
                    setMusicModalOpen(false)
                }}
                onClose={() => setMusicModalOpen(false)}
            />

            <KakaoPlaceSearch
                visible={placeSearchOpen}
                onSelect={(place) => {
                    setEditSpaceName(place.place_name)
                    const addressStr = place.address_name || place.road_address_name || ''
                    setEditAddress(addressStr)
                    setEditLat(parseFloat(place.y) || 0)
                    setEditLng(parseFloat(place.x) || 0)

                    // 주소에서 구 추출 (공백 분리 후 '구' 종료 토큰 탐색 — regex backtracking 없음)
                    const guPart = addressStr.split(' ').find(token => token.endsWith('구'))

                    if (guPart) {
                        setEditDistrict(guPart)
                        const matched = districts?.find(d => d.displayName === guPart)
                        if (matched?.districtCategory) {
                            setEditDistrictCategory(matched.districtCategory)
                        }
                    }

                    setPlaceSearchOpen(false)
                }}
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
        top: 0, left: 0, right: 0, bottom: 0,
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
        height: screenHeight * 0.67,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
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
        paddingTop: 36,
        flex: 1,
        flexDirection: 'column',
        gap: 24,
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
        top: 20,
        left: width * 0.29,
        width: 110,
        height: 80,
        zIndex: 5,
    },

    imageBackground: {
        position: 'absolute',
        width: width * 0.48,
        height: screenHeight * 0.25,
        left: -8,
        top: 5,
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },

    placeImage: {
        width: width * 0.435,
        height: screenHeight * 0.225,
        borderRadius: 4,
        marginBottom: 10,
        marginTop: 10,
        top: 5,
        overflow: 'hidden',
    },

    editImageBadge: {
        position: 'absolute',
        bottom: 10,
        left: 5,
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
        bottom: 211,
        left: -10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#000000',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
    },

    coverBadgeText: {
        fontSize: 8,
        color: '#ffffff',
        fontWeight: '600',
    },

    stampImage: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: screenHeight * 0.16,
        height: screenHeight * 0.16,
    },

    infoArea: {
        position: 'absolute',
        bottom: 70,
        left: 120,
        right: 16,
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingLeft: 90,
    },

    infoEditButton: {
        flex: 1,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    infoText: {
        flex: 1,
        fontSize: 12,
        color: '#333',
        textAlign: 'left',
        lineHeight: 24,
        fontFamily: 'Griun_Gellyroll',
    },

    icon: {
        width: 12,
        height: 12,
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
        height: 140,
        borderRadius: 12,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
        bottom: 40,
    },

    reviewText: {
        fontSize: 13,
        color: '#333',
        textAlign: 'center',
        lineHeight: 20,
        width: '95%',
        fontFamily: 'Griun_Gellyroll',
    },

    editReviewInput: {
        width: '102%',
        height: screenHeight * 0.15,
        borderRadius: 16,
        paddingHorizontal: 20,
        fontSize: 13,
        lineHeight: 20,
        alignContent: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        fontFamily: 'Griun_Gellyroll',
    },

    musicBox: {
        bottom: 70,
        flexDirection: 'row',
        height: screenHeight * 0.09,
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

    editBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        bottom: 86,
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
