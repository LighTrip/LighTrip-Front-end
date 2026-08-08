import DatePickerModal from '@/src/components/passport/DatePickerModal'
import KakaoPlaceSearch from '@/src/components/passport/KakaoPlaceSearch'
import MusicSearch from '@/src/components/passport/MusicSearch'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import {
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Shadow } from 'react-native-shadow-2'

import Dropdown from '@/src/components/common/Dropdown'
import RegionDropdown from '@/src/components/common/RegionDropdown'
import NoiseOverlay from '@/src/components/common/NoiseOverlay'
import { DISTRICT_CATEGORY_MAP, matchDistrictFromAddress } from '@/src/constant/regions'
import { editStyles as styles } from '../components/placeStyles'
import { scaleW, scaleH } from '@/src/utils/scale'

// API
import { getPresignedUrl, uploadToS3 } from '@/src/api/passport/image.api'
import { CATEGORY_MAP, changeCoverImage, createPassport, getMyPassportDistricts, textColor, Visibility } from '@/src/api/passport/passport.api'
import { useTeamMode } from '@/src/components/common/TeamModeContext'
import { predictCoverTextColor } from '@/src/features/passport/cover_ai/coverColorHelper'

const { width, height: screenHeight } = Dimensions.get('window')
const CARD_WIDTH = width * 0.91

const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY

const hexToRgb = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `${r},${g},${b}`
}

const PLACE_TYPES = ['☕ 카페', '🍽️ 식당', '🍶 술집', '🏞️ 공원', '🎬 문화', '🏋️ 운동', '🛍️ 쇼핑', '📦 기타']

// 주소에서 도시에 해당하는 구 목록 찾기

const InfoRow = ({ iconName, text, onPress }: { iconName: string; text: string; onPress?: () => void }) => (
    <View style={styles.infoRowWrapper}>
        <TouchableOpacity onPress={onPress} disabled={!onPress}>
            <View style={styles.infoRow}>
                <Ionicons name={iconName as any} size={18} color="#4A6FA5" />
                <Text style={styles.infoText}>{text}</Text>
            </View>
        </TouchableOpacity>
        <View style={styles.divider} />
    </View>
)

type Props = {
    onBack: () => void
    onComplete: (item: any) => void
    photos: string[]
    description: string
    visitDate: Date | null
    locationAddress: string | null
    locationRegion: string | null
    locationName: string | null
    latitude: number | null
    longitude: number | null
    aiDraft: { draft: string; category: string } | null
}

const EditPlaceScreen = ({
    onBack,
    onComplete,
    photos,
    description,
    visitDate,
    locationRegion,
    locationName: initialLocationName,
    latitude,
    longitude,
    locationAddress,
    aiDraft,
}: Props) => {

    const insets = useSafeAreaInsets()
    const TAB_BAR_HEIGHT = 64
    const [cardHeight, setCardHeight] = useState(0)

    const [date, setDate] = useState(visitDate ?? new Date())
    const [showDatePicker, setShowDatePicker] = useState(false)

    const formatDate = (date: Date) => {
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
    }

    const [placeType, setPlaceType] = useState('☕ 카페')

    const [region, setRegion] = useState<string>(locationRegion ?? '선택')

    // 장소 이름 (수동 검색으로 변경 가능)
    const [locationName, setLocationName] = useState(initialLocationName ?? '위치 정보 없음')
    const [placeSearchOpen, setPlaceSearchOpen] = useState(false)
    const [currentAddress, setCurrentAddress] = useState(locationAddress ?? '')
    const [currentLat, setCurrentLat] = useState(latitude ?? 0)
    const [currentLng, setCurrentLng] = useState(longitude ?? 0)

    const [content, setContent] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [visibility, setVisibility] = useState<Visibility>('PUBLIC')

    const VISIBILITY_CYCLE: Visibility[] = ['PUBLIC', 'FRIENDS_ONLY', 'PRIVATE']
    const VISIBILITY_LABEL: Record<Visibility, string> = {
        PUBLIC: '공개',
        FRIENDS_ONLY: '친구만',
        PRIVATE: '비공개',
    }
    const VISIBILITY_SUB: Record<Visibility, string> = {
        PUBLIC: '모든 사람이 볼 수 있어요',
        FRIENDS_ONLY: '친구만 볼 수 있어요',
        PRIVATE: '나만 볼 수 있어요',
    }
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)


    const [music, setMusic] = useState<{ title: string; artist: string; artwork: string } | null>(null)
    const [musicModalOpen, setMusicModalOpen] = useState(false)

    const { isTeamMode, teamId } = useTeamMode()
    const [themeColor, setThemeColor] = useState('#F8FAFD')

    const THEME_COLORS = ['#F8FAFD', '#FFF0F5', '#FFF4EE', '#FFFBEE', '#EEFFF5']

    useEffect(() => {
        if (aiDraft?.draft) setContent(aiDraft.draft)
        if (aiDraft?.category) {
            const matched = PLACE_TYPES.find(type =>
                type.includes(aiDraft.category) || CATEGORY_MAP[type] === aiDraft.category
            )
            if (matched) setPlaceType(matched)
        }
    }, [])


    // 장소 선택 시 도시 감지 → 구 목록 자동 교체
    const handlePlaceSelect = (item: any) => {
        setLocationName(item.place_name)
        const address = item.address_name || item.road_address_name || ''
        setCurrentAddress(address)
        setCurrentLat(parseFloat(item.y) ?? 0)  // 카카오: y가 위도
        setCurrentLng(parseFloat(item.x) ?? 0)  // 카카오: x가 경도

        setRegion(matchDistrictFromAddress(address) ?? '선택')

        setPlaceSearchOpen(false)
    }

    const handleSubmit = async () => {
        if (photos.length === 0) return alert('사진을 선택해 주세요.')
        if (!content) return alert('내용을 입력해 주세요.')
        if (region === '선택') return alert('방문 지역을 선택해 주세요.')

        setIsGenerating(true)
        try {
            const imageUrls = await Promise.all(
                photos.map(async (uri) => {
                    const presignedRes = await getPresignedUrl('image/jpeg')
                    const presignedUrl = presignedRes.data?.presignedUrl
                    const imageUrl = presignedRes.data?.imageUrl
                    if (!presignedUrl) throw new Error('presignedUrl 없음')
                    await uploadToS3(presignedUrl, uri)
                    return imageUrl
                })
            )
            // 3. 여권 등록
            const res = await createPassport({
                imageUrls,
                content,
                latitude: currentLat,
                longitude: currentLng,
                address: currentAddress,
                visitedAt: (() => { const d = date > new Date() ? new Date() : date; return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })(),
                category: CATEGORY_MAP[placeType] ?? 'ETC',
                districtCategory: DISTRICT_CATEGORY_MAP[region] ?? region,
                visibility: visibility,
                spaceName: locationName,
                district: region !== '선택' ? region : undefined,
                musicTitle: music?.title,
                musicArtist: music?.artist,
                theme: hexToRgb(themeColor),
                teamId: isTeamMode && teamId ? Number(teamId) : undefined,
                aiCategory: aiDraft?.category,
            })

            const resData = res.data?.data ?? res.data
            const createdPassportId = resData?.passportId

            try {
                const districtCategory = DISTRICT_CATEGORY_MAP[region] ?? region
                const districtsRes = await getMyPassportDistricts(isTeamMode && teamId ? teamId : undefined)
                const districts: any[] = districtsRes.data?.data ?? []
                const targetDistrict = districts.find(
                    (d: any) => d.displayName === region || d.districtCategory === districtCategory
                )
                if (targetDistrict?.coverId != null && imageUrls[0]) {
                    await changeCoverImage(targetDistrict.coverId, imageUrls[0])
                    const colorHex = await predictCoverTextColor(imageUrls[0], region)
                    await textColor(targetDistrict.coverId, colorHex)
                } else {
                    console.error('[커버] targetDistrict:', JSON.stringify(targetDistrict), '/ imageUrls[0]:', imageUrls[0])
                }
            } catch (aiErr: any) {
                console.error('[커버 설정 실패]', aiErr?.response?.status, JSON.stringify(aiErr?.response?.data))
            }

            onComplete({createdPassportId})
        } catch (err: any) {
            console.error('[등록 실패]', err?.message, err?.response?.status, JSON.stringify(err?.response?.data))
            alert('등록에 실패했어요')
        } finally {
            setIsGenerating(false)
        }
    }


    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: '#F8FAFD' }}
            edges={['top', 'left', 'right', 'bottom']}
        >
        <KeyboardAvoidingView
            style={{flex: 1, backgroundColor: "#F8FAFD"}}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
                <View
                    style={{ flex: 1, alignSelf: 'center', width: CARD_WIDTH }}
                    onLayout={(e) => setCardHeight(Math.round(e.nativeEvent.layout.height))}
                >
            {cardHeight > 0 && (
            <Shadow
                distance={6}
                startColor={'#00000012'}
                offset={[0, 2]}
                style={{ width: CARD_WIDTH, height: cardHeight, borderRadius: 16 }}
            >
                <View style={[styles.logContainer, { height: cardHeight, marginTop: 0, marginBottom: 0 }]}>
                    <NoiseOverlay />
                    <View style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: themeColor,
                        opacity: 0.45,
                    }} />

                    <View style={styles.header}>
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={16} color="#333" />
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.headerTitle}>기록 편집</Text>
                            {isTeamMode && (
                                <View style={{ backgroundColor: '#1A3A6B', borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2, left: 120 }}>
                                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>팀</Text>
                                </View>
                            )}
                        </View>
                        <View style={{ width: 20 }} />
                    </View>

                    <View style={[styles.photoBox, { height: scaleH(135) }]}>
                        {photos.length > 1 ? (
                            <ScrollView
                                horizontal
                                style={{ flex: 1 }}
                                contentContainerStyle={{ flexDirection: 'row' }}
                                showsHorizontalScrollIndicator={false}
                                pagingEnabled
                                onScroll={(e) => {
                                    const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH)
                                    setCurrentPhotoIndex(index)
                                }}
                                scrollEventThrottle={16}
                            >
                                {photos.map((uri, index) => (
                                    <Image
                                        key={index}
                                        source={{ uri }}
                                        style={{ width: CARD_WIDTH * 0.91, height: '100%' }}
                                        resizeMode="cover"
                                    />
                                ))}
                            </ScrollView>
                        ) : photos.length === 1 ? (
                            <Image
                                source={{ uri: photos[0] }}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="cover"
                            />
                        ) : (
                            <Text style={{ color: '#aaa' }}>사진 없음</Text>
                        )}
                    </View>

                    {photos.length > 1 && (
                        <View style={styles.photoIndicatorRow}>
                            {photos.map((_, index) => (
                                <View
                                    key={index}
                                    style={index === currentPhotoIndex
                                        ? styles.photoIndicatorDotActive
                                        : styles.photoIndicatorDot
                                    }
                                />
                            ))}
                        </View>
                    )}

                    <View style={styles.infoSection}>
                        {/* 장소 이름 */}
                        <InfoRow
                            iconName="location-outline"
                            text={locationName}
                            onPress={() => setPlaceSearchOpen(true)}
                        />

                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            <View style={styles.infoRowWrapper}>
                                <View style={styles.infoRow}>
                                    <Ionicons name="calendar-outline" size={17} color="#4A6FA5" />
                                    <Text style={styles.infoText}>{formatDate(date)}</Text>
                                </View>
                                <View style={styles.divider} />
                            </View>
                        </TouchableOpacity>

                        <DatePickerModal
                            visible={showDatePicker}
                            date={date}
                            onChange={(newDate) => setDate(newDate)}
                            onClose={() => setShowDatePicker(false)}
                        />
                    </View>

                    <View style={styles.dropdownRow}>
                        <Dropdown
                            label="장소 유형"
                            value={placeType}
                            options={PLACE_TYPES}
                            onSelect={setPlaceType}
                        />
                        <RegionDropdown
                            label="방문 지역"
                            value={region}
                            onSelect={setRegion}
                        />
                    </View>

                    <View style={styles.contentSection}>
                        <View style={styles.contentLabelRow}>
                            <Text style={styles.contentLabel}>내용</Text>
                            <Text style={{ fontSize: 13, color: '#aaa' }}>{content.length}/80</Text>
                        </View>
                        <TextInput
                            style={styles.contentInput}
                            multiline
                            placeholder='내용을 입력하세요'
                            placeholderTextColor="#aaa"
                            value={content}
                            onChangeText={setContent}
                            editable={!isGenerating}
                            maxLength={80}
                        />
                    </View>

                    {/* 뮤직카드 */}
                    <TouchableOpacity style={[styles.musicCard, { marginTop: 'auto', marginBottom: scaleH(60) }]} onPress={() => setMusicModalOpen(true)}>
                        {music ? (
                            <>
                                <Image source={{ uri: music.artwork }} style={styles.albumArt} />
                                <View style={styles.musicInfo}>
                                    <Text style={styles.musicTitle} numberOfLines={1}>{music.title}</Text>
                                    <Text style={styles.musicArtist} numberOfLines={1}>{music.artist}</Text>
                                </View>
                            </>
                        ) : (
                            <View style={styles.musicInfo}>
                                <Text style={styles.musicTitle}>음악 추가</Text>
                                <Text style={styles.musicArtist}>탭해서 검색하세요</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* 음악 검색 모달 */}
                    <MusicSearch
                        visible={musicModalOpen}
                        onSelect={(item) => {
                            setMusic(item)
                            setMusicModalOpen(false)
                        }}
                        onClose={() => setMusicModalOpen(false)}
                    />


                    {/* 장소 검색 모달 */}
                    <KakaoPlaceSearch
                        visible={placeSearchOpen}
                        onSelect={(item) => handlePlaceSelect(item)}
                        onClose={() => setPlaceSearchOpen(false)}
                    />
                    

                    <View style={[styles.publicRow, { justifyContent: 'space-between', paddingHorizontal: 16 }]}>
                        {(
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, left: 10 }}>
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
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View>
                                <Text style={styles.publicTitle}>여권 공개 여부</Text>
                                <Text style={styles.publicSub}>{VISIBILITY_SUB[visibility]}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.visibilityButton}
                                onPress={() => {
                                    const idx = VISIBILITY_CYCLE.indexOf(visibility)
                                    setVisibility(VISIBILITY_CYCLE[(idx + 1) % 3])
                                }}
                            >
                                <Text style={styles.visibilityButtonText}>{VISIBILITY_LABEL[visibility]}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Shadow>
            )}
            </View>

            <TouchableOpacity
                style={[styles.clickContainer, { marginTop: scaleH(16), marginBottom: TAB_BAR_HEIGHT }]}
                onPress={handleSubmit}
            >
                <Text style={styles.clickText}>등록하기</Text>
            </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default EditPlaceScreen
