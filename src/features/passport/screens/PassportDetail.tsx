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
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { compressImagesForUpload } from '@/src/utils/imageUpload'
import MarqueeText from '@/src/components/common/MarqueeText'
import Svg, { Path } from 'react-native-svg'

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import NoiseOverlay from '@/src/components/common/NoiseOverlay'
import { useTeamMode } from '@/src/components/common/TeamModeContext'
import DatePickerModal from '@/src/components/passport/DatePickerModal'
import { getPresignedUrl, uploadToS3 } from '@/src/api/passport/image.api'

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
import { scaleW, scaleH, scaleFont } from '@/src/utils/scale'

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
    '☕ 카페': '#A9714A',
    '🍽️ 식당': '#D65C6B',
    '🍶 술집': '#8E5FA6',
    '🏞️ 공원': '#5FA05A',
    '🎬 문화': '#F0785A',
    '🏋️ 운동': '#4472A8',
    '🛍️ 쇼핑': '#E8558F',
    '📦 기타': '#7C8798',
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
    // 음악이 없을 때도 앨범아트 자리를 그대로 두어야 카드 모양이 흐트러지지 않는다.
    const content = (
        <>
            {music?.artwork ? (
                <Image source={{ uri: music.artwork }} style={styles.musicImage} />
            ) : (
                <View style={[styles.musicImage, styles.musicImagePlaceholder]}>
                    <Ionicons name="musical-notes" size={22} color="#B6BDC7" />
                </View>
            )}

            <View style={styles.musicTextArea}>
                {music ? (
                    <>
                        <MarqueeText style={styles.musicTitle}>{music.title}</MarqueeText>

                        {/* 아티스트가 없으면 빈 줄이 남지 않도록 그리지 않는다. */}
                        {!!music.artist && (
                            <MarqueeText style={styles.artist}>{music.artist}</MarqueeText>
                        )}
                    </>
                ) : (
                    <Text style={styles.musicEmptyText}>음악 없음</Text>
                )}
            </View>
        </>
    )

    return onPress ? (
        <TouchableOpacity style={styles.musicBox} onPress={onPress}>{content}</TouchableOpacity>
    ) : (
        <View style={styles.musicBox}>{content}</View>
    )
}

const PassportDetail = ({ item, onBack, onNext, onPrev, districts, editable = true, sourceLabel }: Props) => {
    const { isTeamMode, teamId } = useTeamMode()
    const insets = useSafeAreaInsets()
    const [isEditing, setIsEditing] = useState(false)
    const [editReview, setEditReview] = useState(item.content ?? '')
    const [editCategory, setEditCategory] = useState(CATEGORY_TO_KOREAN[item.category] ?? '선택')
    const [editDate, setEditDate] = useState(new Date(item.visitedAt))
    const [editImageUris, setEditImageUris] = useState<string[]>(item.imageUrls ?? [])
    const [editMusic, setEditMusic] = useState<{ title: string; artist: string; artwork: string } | null>(null)
    const [musicArtwork, setMusicArtwork] = useState<string | null>(null)
    const [isCover, setIsCover] = useState(
        !!(item._districtThumbnailUrl && (item.imageUrls?.[0] ?? item.thumbnailUrl) === item._districtThumbnailUrl)
    )
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
            allowsMultipleSelection: true,
            selectionLimit: 5,
            allowsEditing: false,
            quality: 1,
        })

        if (!result.canceled) {
            // 원본 그대로 두면 한 장에 3MB 가 넘어 나중에 불러올 때 느리다.
            setEditImageUris(await compressImagesForUpload(result.assets.map(a => a.uri)))
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
                imageUrls: await Promise.all(editImageUris.map(async (uri) => {
                    if (uri.startsWith('https://')) return uri
                    const mimeType = uri.endsWith('.png') ? 'image/png' : uri.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
                    const presignedRes = await getPresignedUrl(mimeType)
                    await uploadToS3(presignedRes.data.presignedUrl, uri)
                    return presignedRes.data.imageUrl
                })),
                district: editDistrict,
                districtCategory: matchedDistrict?.districtCategory ?? DISTRICT_CATEGORY_MAP[editDistrict] ?? editDistrictCategory,
                spaceName: editSpaceName,
                visibility: visibility,
                address: editAddress,
                latitude: editLat,
                longitude: editLng,
                theme: hexToRgb(themeColor),
            }

            if (isNewDistrict) {
                // 서버에 '여권 이동' API 가 없어서 새로 만들고 원본을 지운다.
                // 그 과정에서 좋아요·스크랩이 사라지므로 반드시 확인을 받는다.
                const confirmed = await new Promise<boolean>((resolve) => {
                    Alert.alert(
                        '다른 지역으로 옮길까요?',
                        `이 기록을 ${editDistrict} 로 옮기면 새 여권으로 다시 만들어집니다.` +
                        `\n지금까지 받은 좋아요와 스크랩은 사라지며 되돌릴 수 없습니다.`,
                        [
                            { text: '취소', style: 'cancel', onPress: () => resolve(false) },
                            { text: '옮기기', style: 'destructive', onPress: () => resolve(true) },
                        ],
                        { cancelable: true, onDismiss: () => resolve(false) },
                    )
                })

                if (!confirmed) return

                let imageUrls = item.imageUrls
                if (!imageUrls || imageUrls.length === 0) {
                    const detailRes = await getPassportDetail(item.passportId)
                    imageUrls = detailRes.data?.data?.imageUrls ?? []
                }

                const createRes = await createPassport({ ...passportData, imageUrls })
                const createdId = createRes?.data?.data?.passportId

                try {
                    await deletePassport(item.passportId)
                } catch (deleteError) {
                    // 원본 삭제가 실패하면 같은 기록이 두 개 남는다. 방금 만든 쪽을 되돌린다.
                    console.error('원본 삭제 실패, 생성분 롤백:', deleteError)

                    if (createdId) {
                        await deletePassport(createdId).catch(() => {})
                    }

                    Alert.alert(
                        '옮기지 못했어요',
                        '기존 기록을 정리하지 못해 되돌렸습니다. 잠시 후 다시 시도해 주세요.',
                    )
                    return
                }

                onBack()
            } else {
                await updatePassport(item.passportId, passportData)
                await changePassportVisibility(item.passportId, visibility)

                // 서버 수정 API 는 날짜·주소·좌표를 받지 않는다(설계상 수정 불가).
                // 화면만 바뀐 채로 두면 다시 들어왔을 때 옛 값으로 돌아가 혼란스럽다.
                const originalDate = (item.visitedAt ?? '').split('T')[0]
                const isDateChanged =
                    !!originalDate &&
                    editDate.toISOString().split('T')[0] !== originalDate
                const isPlaceChanged =
                    !!item.address && editAddress !== item.address

                if (isDateChanged || isPlaceChanged) {
                    Alert.alert(
                        '일부 항목은 저장되지 않았어요',
                        '방문 날짜와 장소는 수정할 수 없어 원래 값으로 유지됩니다.',
                    )
                }

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
                const districtsRes = await getMyPassportDistricts(isTeamMode && teamId ? teamId : undefined)
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
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
            <KeyboardAwareScrollView
                contentContainerStyle={[styles.container, styles.scrollContent, { paddingTop: Math.max(insets.top - scaleW(50), 0) }]}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid
                showsVerticalScrollIndicator={false}
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

                        <View style={[styles.tape, { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 2 }]}>
                            <Svg width={scaleW(120)} height={scaleW(80)} viewBox="0 0 90 69" fill="none">
                                <Path
                                    d="M15.0562 0L85.0885 42.785L71.4908 46.833L74.0323 60.3988L3.99995 17.6137L15.0562 0Z"
                                    fill={TAPE_COLOR_MAP[editCategory] ?? '#FFD9D9'}
                                />
                            </Svg>
                        </View>

                        <View style={styles.topRow}>
                        <View style={styles.imageColumn}>
                            <View style={styles.imageBackground} />
                            {editImageUris.length > 1 ? (
                                <View
                                    style={{
                                        width: scaleW(175),
                                        height: scaleW(220),
                                        marginBottom: scaleW(10),
                                        marginTop: scaleW(20),
                                        top: scaleW(5),
                                        borderRadius: scaleW(4),
                                        overflow: 'hidden',
                                    }}
                                >
                                    <ScrollView
                                        horizontal
                                        pagingEnabled
                                        showsHorizontalScrollIndicator={false}
                                        decelerationRate="fast"
                                    >
                                        {editImageUris.map((uri: string, idx: number) => (
                                            <Image
                                                key={idx}
                                                source={{ uri }}
                                                style={{ width: scaleW(175), height: scaleW(220) }}
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
                                        source={{ uri: editImageUris[0] ?? item.image?.uri }}
                                        style={styles.placeImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.editImageBadge}>
                                        <Ionicons name="camera-outline" size={14} color="#000000" />
                                    </View>
                                </TouchableOpacity>
                            ) : (
                                <Image
                                    source={{ uri: editImageUris[0] ?? item.image?.uri }}
                                    style={styles.placeImage}
                                    resizeMode="cover"
                                />
                            )}

                            {isEditing && (
                                <TouchableOpacity
                                    style={[styles.coverBadge, { backgroundColor: TAPE_COLOR_MAP[editCategory] ?? '#FFD9D9' }]}
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
                            style={[styles.stampImage, !isEditing && { top: scaleW(30) }]}
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
                                <Svg width={scaleW(12)} height={scaleW(16)} viewBox="0 0 15 20" fill="none">
                                    <Path d="M7.22461 9.4126C6.64445 9.4126 6.08805 9.18213 5.67781 8.77189C5.26758 8.36166 5.03711 7.80526 5.03711 7.2251C5.03711 6.64494 5.26758 6.08854 5.67781 5.6783C6.08805 5.26807 6.64445 5.0376 7.22461 5.0376C7.80477 5.0376 8.36117 5.26807 8.77141 5.6783C9.18164 6.08854 9.41211 6.64494 9.41211 7.2251C9.41211 7.51236 9.35553 7.79682 9.2456 8.06222C9.13566 8.32762 8.97453 8.56877 8.77141 8.77189C8.56828 8.97502 8.32713 9.13615 8.06173 9.24608C7.79633 9.35602 7.51188 9.4126 7.22461 9.4126ZM7.22461 1.1001C5.60016 1.1001 4.04224 1.74541 2.89358 2.89407C1.74492 4.04273 1.09961 5.60065 1.09961 7.2251C1.09961 11.8188 7.22461 18.6001 7.22461 18.6001C7.22461 18.6001 13.3496 11.8188 13.3496 7.2251C13.3496 5.60065 12.7043 4.04273 11.5556 2.89407C10.407 1.74541 8.84906 1.1001 7.22461 1.1001Z" fill={TAPE_COLOR_MAP[editCategory] ?? '#FFD9D9'} />
                                </Svg>
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
                                <Svg width={scaleW(13)} height={scaleW(13)} viewBox="0 0 16 16" fill="none">
                                    <Path d="M1.3335 12.6668C1.3335 13.8002 2.20016 14.6668 3.3335 14.6668H12.6668C13.8002 14.6668 14.6668 13.8002 14.6668 12.6668V7.3335H1.3335V12.6668ZM12.6668 2.66683H11.3335V2.00016C11.3335 1.60016 11.0668 1.3335 10.6668 1.3335C10.2668 1.3335 10.0002 1.60016 10.0002 2.00016V2.66683H6.00016V2.00016C6.00016 1.60016 5.7335 1.3335 5.3335 1.3335C4.9335 1.3335 4.66683 1.60016 4.66683 2.00016V2.66683H3.3335C2.20016 2.66683 1.3335 3.5335 1.3335 4.66683V6.00016H14.6668V4.66683C14.6668 3.5335 13.8002 2.66683 12.6668 2.66683Z" fill={TAPE_COLOR_MAP[editCategory] ?? '#FFD9D9'} />
                                </Svg>
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

                            {isEditing && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: scaleW(6), marginTop: scaleW(10) }}>
                                    {THEME_COLORS.map((color) => (
                                        <TouchableOpacity
                                            key={color}
                                            onPress={() => setThemeColor(color)}
                                            style={{
                                                width: scaleW(15),
                                                height: scaleW(15),
                                                borderRadius: scaleW(10),
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
                    </View>

                    {/* 구분선 */}
                    <View style={[styles.dividerRow, { position: 'absolute', top: scaleH(300), left: 0, right: 0 }]}>
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
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

export default PassportDetail

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFD',
    },

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
        padding: scaleW(16),
        gap: scaleW(16),
        paddingBottom: scaleW(65),
        paddingTop: 0,
    },

    headerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: scaleW(16),
        padding: scaleW(20),
        marginTop: 0,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },

    districtTitle: {
        fontSize: scaleFont(22),
        fontWeight: 'bold',
        color: '#000',
        marginBottom: scaleW(6),
    },

    visitText: {
        fontSize: scaleFont(14),
        color: '#888',
    },

    passportCard: {
        width: '100%',
        flex: 1,
        maxHeight: Platform.OS === 'ios' ? scaleW(610) : undefined,
        backgroundColor: '#FFFFFF',
        borderRadius: scaleW(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
        // paddingBottom: scaleH(20),
    },

    topHalf: {
        padding: scaleW(20),
        paddingTop: scaleW(30),
        height: scaleW(280),
        justifyContent: 'flex-start',
    },

    topRow: {
        flex: 1,
        flexDirection: 'row',
        gap: scaleW(36),
    },

    imageColumn: {
        width: scaleW(175),
        justifyContent: 'center',
    },

    bottomHalf: {
        padding: scaleW(20),
        paddingTop: scaleW(20),
        flex: 1,
        flexDirection: 'column',
        gap: scaleW(16),
        justifyContent: 'space-between',
    },

    closeButton: {
        position: 'absolute',
        top: scaleW(12),
        right: scaleW(16),
        zIndex: 10,
    },

    closeText: {
        fontSize: scaleFont(18),
        color: '#1A3A6B',
        fontWeight: 'bold',
    },

    tape: {
        position: 'absolute',
        top: scaleW(20),
        left: scaleW(117),
        width: scaleW(120),
        height: scaleW(80),
        zIndex: 5,
    },

    imageBackground: {
        position: 'absolute',
        width: scaleW(193),
        height: scaleW(240),
        left: scaleW(-8),
        top: scaleW(5),
        backgroundColor: '#FFFFFF',
        borderRadius: scaleW(4),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },

    placeImage: {
        width: scaleW(175),
        height: scaleW(220),
        borderRadius: scaleW(4),
        marginBottom: scaleW(10),
        marginTop: scaleW(20),
        top: scaleW(5),
        overflow: 'hidden',
    },

    editImageBadge: {
        position: 'absolute',
        bottom: scaleW(10),
        left: scaleW(5),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff80',
        borderRadius: scaleW(12),
        paddingHorizontal: scaleW(8),
        paddingVertical: scaleW(4),
        gap: scaleW(4),
    },

    coverBadge: {
        position: 'absolute',
        bottom: scaleW(233),
        left: scaleW(-5),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#000000',
        borderRadius: scaleW(12),
        paddingHorizontal: scaleW(8),
        paddingVertical: scaleW(4),
        gap: scaleW(4),
    },

    coverBadgeText: {
        fontSize: scaleFont(8),
        color: '#ffffff',
        fontWeight: '600',
    },

    stampImage: {
        position: 'absolute',
        top: scaleW(10),
        right: scaleW(10),
        width: scaleW(110),
        height: scaleW(110),
    },

    infoArea: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleW(6),
    },

    infoEditButton: {
        flex: 1,
        borderRadius: scaleW(10),
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleW(4),
    },

    infoText: {
        flex: 1,
        fontSize: scaleFont(12),
        color: '#333',
        textAlign: 'left',
        lineHeight: scaleW(24),
        fontFamily: 'Griun_Gellyroll',
    },

    icon: {
        width: scaleW(12),
        height: scaleW(12),
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
        height: scaleW(110),
        borderRadius: scaleW(12),
        top: scaleW(40),
        alignItems: 'center',
        justifyContent: 'center',
    },

    reviewText: {
        fontSize: scaleFont(14),
        color: '#333',
        textAlign: 'center',
        lineHeight: scaleW(20),
        width: '95%',
        fontFamily: 'Griun_Gellyroll',
    },

    editReviewInput: {
        width: '100%',
        height: '100%',
        borderRadius: scaleW(16),
        paddingTop: scaleW(10),
        paddingHorizontal: scaleW(20),
        fontSize: scaleFont(13),
        lineHeight: scaleW(20),
        textAlignVertical: 'center',
        backgroundColor: '#ffffff',
        fontFamily: 'Griun_Gellyroll',
    },

    musicBox: {
        flexDirection: 'row',
        height: scaleW(79),
        width: '100%',
        top: scaleW(25),
        borderRadius: scaleW(16),
        alignItems: 'center',
        gap: scaleW(12),
        backgroundColor: '#ffffff',
    },

    musicImage: {
        width: scaleW(50),
        height: scaleW(50),
        borderRadius: scaleW(25),
        marginLeft: scaleW(20),
    },

    // 제목이 길면 카드를 넘치므로 남는 폭 안에서만 흐르게 한다.
    musicTextArea: {
        flex: 1,
        marginRight: scaleW(10),
    },

    musicImagePlaceholder: {
        backgroundColor: '#EEF1F5',
        alignItems: 'center',
        justifyContent: 'center',
    },

    musicEmptyText: {
        fontSize: scaleFont(15),
        fontWeight: '600',
        color: '#9CA3AF',
        marginLeft: scaleW(10),
    },

    musicTitle: {
        fontSize: scaleFont(15),
        fontWeight: 'bold',
        color: '#000',
        marginLeft: scaleW(10),
    },

    artist: {
        fontSize: scaleFont(13),
        color: '#888',
        marginLeft: scaleW(10),
    },

    editBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        top: scaleW(10),
    },

    editText: {
        width: scaleW(110),
        height: scaleW(20),
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: scaleFont(10),
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
        width: scaleW(220),
        maxHeight: scaleW(350),
        backgroundColor: '#fff',
        borderRadius: scaleW(16),
        paddingVertical: scaleW(8),
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
        paddingHorizontal: scaleW(16),
        paddingVertical: scaleW(12),
    },

    modalItemSelected: {
        backgroundColor: '#F0F4FF',
    },

    modalItemText: {
        fontSize: scaleFont(14),
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
        paddingVertical: scaleW(12),
        gap: scaleW(12),
        marginRight: scaleW(15),
    },

    publicTitle: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        textAlign: 'right',
        color: '#222',
    },

    publicSub: {
        fontSize: scaleFont(12),
        color: '#888',
    },
})
