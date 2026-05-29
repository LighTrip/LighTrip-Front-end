import {
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Dimensions,
    View,
    Switch,
    Platform,
    ActivityIndicator,
    KeyboardAvoidingView,
} from 'react-native'
import React, { useState, useEffect } from 'react'
import { Shadow } from 'react-native-shadow-2'
import { Ionicons } from '@expo/vector-icons'
import DatePickerModal from '@/src/components/passport/DatePickerModal'
import KakaoPlaceSearch from '@/src/components/passport/KakaoPlaceSearch'
import MusicSearch from '@/src/components/passport/MusicSearch'

import NoiseOverlay from '@/src/components/common/NoiseOverlay'
import Dropdown from '@/src/components/common/Dropdown'
import { REGIONS, DISTRICT_CATEGORY_MAP } from '@/src/constant/regions'

// API
import { generateAIDraft } from '@/src/api/passport/ai.api'  // AI 초안 생성
import { getPresignedUrl, uploadToS3 } from '@/src/api/passport/image.api'  // 이미지 업로드
import { createPassport, CATEGORY_MAP } from '@/src/api/passport/passport.api'  // 여권 생성

const { width } = Dimensions.get('window')
const CARD_WIDTH = width * 0.91

const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY

const PLACE_TYPES = ['☕ 카페', '🍽️ 식당', '🍶 술집', '🏞️ 공원', '🎬 문화', '🏋️ 운동', '🛍️ 쇼핑', '📦 기타']

// 주소에서 도시에 해당하는 구 목록 찾기
const findDistrictsByAddress = (address: string): string[] => {
    const matchedCity = Object.keys(REGIONS).find(city => address.includes(city))
    return matchedCity ? REGIONS[matchedCity] : REGIONS['서울특별시']
}

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
    photo: string | null
    description: string
    visitDate: Date | null
    locationAddress: string | null
    locationRegion: string | null
    locationName: string | null
    latitude: number | null
    longitude: number | null
}

const EditPlaceScreen = ({
    onBack,
    onComplete,
    photo,
    description,
    visitDate,
    locationRegion,
    locationName: initialLocationName,
    latitude,
    longitude,
    locationAddress,
}: Props) => {

    const [date, setDate] = useState(visitDate ?? new Date())
    const [showDatePicker, setShowDatePicker] = useState(false)

    const formatDate = (date: Date) => {
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
    }

    const [placeType, setPlaceType] = useState('☕ 카페')

    // 구 목록 (장소 선택 시 도시에 맞게 자동 변경)
    const [availableDistricts, setAvailableDistricts] = useState<string[]>(
        Object.values(REGIONS).flat()
    )
    const [region, setRegion] = useState<string>(locationRegion ?? '선택')

    // 장소 이름 (수동 검색으로 변경 가능)
    const [locationName, setLocationName] = useState(initialLocationName ?? '위치 정보 없음')
    const [placeSearchOpen, setPlaceSearchOpen] = useState(false)
    const [currentAddress, setCurrentAddress] = useState(locationAddress ?? '')
    const [currentLat, setCurrentLat] = useState(latitude ?? 0)
    const [currentLng, setCurrentLng] = useState(longitude ?? 0)

    const [content, setContent] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [isPublic, setIsPublic] = useState(true)

    const [music, setMusic] = useState<{ title: string; artist: string; artwork: string } | null>(null)
    const [musicModalOpen, setMusicModalOpen] = useState(false)

    useEffect(() => {
        generateWithAI()
    }, [])

    const generateWithAI = async () => {
        if (!photo) return
        setIsGenerating(true)
        try {
            const data = await generateAIDraft(photo, description)
            if (data.draft) setContent(data.draft)
            if (data.category) {
                const matched = PLACE_TYPES.find(type => type.includes(data.category))
                if (matched) setPlaceType(matched)
            }
        } catch (err) {
            console.error('AI 생성 실패:', err)
            alert('AI 초안 생성 중 오류가 발생했어요')
        } finally {
            setIsGenerating(false)
        }
    }


    // 장소 선택 시 도시 감지 → 구 목록 자동 교체
    const handlePlaceSelect = (item: any) => {
        setLocationName(item.place_name)
        setCurrentAddress(item.address_name ?? '')
        setCurrentLat(parseFloat(item.y) ?? 0)  // 카카오: y가 위도
        setCurrentLng(parseFloat(item.x) ?? 0)  // 카카오: x가 경도

        const address = item.address_name ?? ''
        const districts = findDistrictsByAddress(address)
        setAvailableDistricts(districts)
        const matchedDistrict = districts.find(r => address.includes(r))
        setRegion(matchedDistrict ?? '선택')
    }

    const handleSubmit = async () => {
        if (!photo) return alert('사진을 선택해주세요')
        if (!content) return alert('내용을 입력해주세요')
        if (region === '선택') return alert('방문 지역을 선택해주세요')

        setIsGenerating(true)
        try {
            // 1. presigned URL 발급
            const presignedRes = await getPresignedUrl('image/jpeg')
            const presignedUrl = presignedRes.data?.presignedUrl
            const imageUrl = presignedRes.data?.imageUrl

            if (!presignedUrl) throw new Error('presignedUrl 없음')

            // 2. S3 업로드
            await uploadToS3(presignedUrl, photo!)

            
            // 3. 여권 등록
            const res = await createPassport({
                imageUrls: [imageUrl],
                content,
                latitude: currentLat,
                longitude: currentLng,
                address: currentAddress,
                visitedAt: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
                category: CATEGORY_MAP[placeType] ?? 'ETC',
                districtCategory: DISTRICT_CATEGORY_MAP[region] ?? region,
                visibility: isPublic ? 'PUBLIC' : 'PRIVATE',
                spaceName: locationName,
                district: region !== '선택' ? region : undefined,
                musicTitle: music?.title,
                musicArtist: music?.artist,
            })

            const createdPassportId = res.data.data.passportId

            onComplete({createdPassportId})
        } catch (err: any) {
            console.error('등록 실패 상세:', err.response?.data)
            console.error('등록 실패 status:', err.response?.status)
            console.error('등록 실패 message:', err.message)
            console.error('등록 실패 요청 URL:', err.config?.url)
            console.error('등록 실패 요청 data:', err.config?.data)
            console.error('err 전체:', JSON.stringify(err, Object.getOwnPropertyNames(err)))
            alert('등록에 실패했어요')
        } finally {
            setIsGenerating(false)
        }
    }


    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Shadow
                distance={6}
                startColor={'#00000012'}
                offset={[0, 2]}
                style={{ width: CARD_WIDTH, marginBottom: 5, borderRadius: 16 }}
            >
                <View style={styles.logContainer}>
                    <NoiseOverlay />

                    <View style={styles.header}>
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={22} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>기록 편집</Text>
                        <View style={{ width: 20 }} />
                    </View>

                    <View style={styles.photoBox}>
                        {photo !== null ? (
                            <Image
                                source={{ uri: photo }}
                                style={{ width: '100%', height: '100%', borderRadius: 16 }}
                                resizeMode="cover"
                            />
                        ) : (
                            <Text style={{ color: '#aaa' }}>사진 없음</Text>
                        )}
                    </View>

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
                                    <Ionicons name="calendar-outline" size={18} color="#4A6FA5" />
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
                        <Dropdown
                            label="방문 지역"
                            value={region}
                            options={availableDistricts}
                            onSelect={setRegion}
                        />
                    </View>

                    <View style={styles.contentSection}>
                        <View style={styles.contentLabelRow}>
                            <Text style={styles.contentLabel}>내용</Text>
                            {isGenerating && (
                                <View style={styles.generatingRow}>
                                    <ActivityIndicator size="small" color="#1A3A6B" />
                                    <Text style={styles.generatingText}>AI 작성 중...</Text>
                                </View>
                            )}
                        </View>
                        <TextInput
                            style={styles.contentInput}
                            multiline
                            placeholder={isGenerating ? 'AI가 초안을 작성 중이에요...' : '내용을 입력하세요'}
                            placeholderTextColor="#aaa"
                            value={content}
                            onChangeText={setContent}
                            editable={!isGenerating}
                        />
                    </View>

                    {/* 뮤직카드 */}
                    <TouchableOpacity style={styles.musicCard} onPress={() => setMusicModalOpen(true)}>
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
                        onSelect={(item) => setMusic(item)}
                        onClose={() => setMusicModalOpen(false)}
                    />

                    {/* 장소 검색 모달 */}
                    <KakaoPlaceSearch
                        visible={placeSearchOpen}
                        onSelect={(item) => handlePlaceSelect(item)}
                        onClose={() => setPlaceSearchOpen(false)}
                    />
                    

                    <View style={styles.publicRow}>
                        <View>
                            <Text style={styles.publicTitle}>여권 공개 여부</Text>
                            <Text style={styles.publicSub}>{isPublic ? '모든 사람이 볼 수 있어요' : '나만 볼 수 있어요'}</Text>
                        </View>
                        <Switch
                            value={isPublic}
                            onValueChange={setIsPublic}
                            trackColor={{ false: '#D0D0D0', true: '#1A3A6B' }}
                            thumbColor={'#FFFFFF'}
                        />
                    </View>
                </View>
            </Shadow>

            <TouchableOpacity
                style={styles.clickContainer}
                onPress={handleSubmit}
            >
                <Text style={styles.clickText}>등록하기</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    )
}

export default EditPlaceScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFD',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: StatusBar.currentHeight || 65,
    },

    logContainer: {
        position: 'relative',
        height: 645,
        borderRadius: 16,
        backgroundColor: '#F8FAFD',
        justifyContent: 'flex-start',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: 15,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 16,
        marginTop: 15,
    },

    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
    },

    photoBox: {
        width: 340,
        height: 170,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },

    infoSection: {
        width: '90%',
        paddingHorizontal: 16,
        marginTop: 8,
    },

    infoRowWrapper: { width: '100%' },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 10,
    },

    infoText: {
        fontSize: 15,
        color: '#222',
        fontWeight: '600',
        flex: 1,
    },

    divider: {
        height: 1,
        backgroundColor: '#4B4B4B',
    },

    dropdownRow: {
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: 16,
        gap: 8,
        marginTop: 16,
    },

    modalBackdrop: {
        flex: 1,
        backgroundColor: '#00000040',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalBox: {
        width: 200,
        maxHeight: 320,
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

    contentSection: {
        width: '100%',
        minHeight: 130,
        maxHeight: 130,
        paddingHorizontal: 16,
        marginTop: 10,
        gap: 8,
    },

    contentLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    contentLabel: {
        fontSize: 13,
        color: '#555',
        fontWeight: '500',
    },

    generatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    generatingText: {
        fontSize: 12,
        color: '#1A3A6B',
    },

    contentInput: {
        fontSize: 14,
        color: '#222',
        lineHeight: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#C0C0C0',
        paddingVertical: 4,
        minHeight: 40,
    },

    musicCard: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '91%',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
        padding: 12,
        paddingRight: 20, 
        marginTop: -10,
        marginBottom: 10,
        gap: 12,
    },

    albumArt: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#ddd',
    },

    musicInfo: { 
        gap: 4,
        flex: 1,
        maxWidth: '80%',
        overflow: 'hidden',
    },

    musicTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#222',
    },

    musicArtist: {
        fontSize: 13,
        color: '#888',
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

    clickContainer: {
        width: '91%',
        height: 45,
        borderRadius: 16,
        backgroundColor: '#1A3A6B',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 0,
    },

    clickText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
})
