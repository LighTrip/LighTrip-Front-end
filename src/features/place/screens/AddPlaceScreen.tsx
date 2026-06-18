import { Ionicons } from '@expo/vector-icons'
import * as FileSystem from 'expo-file-system/legacy'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import { useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import React, { useEffect, useState } from 'react'
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { Shadow } from 'react-native-shadow-2'

import { generateAIDraft } from '@/src/api/passport/ai.api'
import { getPresignedUrl, uploadToS3 } from '@/src/api/passport/image.api'
import { getMyPremium } from '@/src/api/payment/payment.api'
import NoiseOverlay from '@/src/components/common/NoiseOverlay'
import { matchDistrictFromAddress } from '@/src/constant/regions'
import PassportDetail from '../../passport/screens/PassportDetail'
import EditPlaceScreen from './EditPlaceScreen'

import { editStyles, addStyles as styles } from '../components/placeStyles'

const { width, height: screenHeight } = Dimensions.get('window')
export const CARD_WIDTH = width * 0.91

const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY
const AI_USAGE_KEY = 'ai_draft_usage'

const getWeekKey = () => {
    const now = new Date()
    const year = now.getFullYear()
    const jan1 = new Date(year, 0, 1)
    const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
    return `${year}-W${week}`
}

const checkAiLimit = async (): Promise<boolean> => {
    const weekKey = getWeekKey()
    const stored = await SecureStore.getItemAsync(AI_USAGE_KEY)
    if (!stored) return true
    const { week, count } = JSON.parse(stored)
    return week !== weekKey || count < 5
}

const incrementAiUsage = async () => {
    const weekKey = getWeekKey()
    const stored = await SecureStore.getItemAsync(AI_USAGE_KEY)
    let count = 0
    if (stored) {
        const parsed = JSON.parse(stored)
        count = parsed.week === weekKey ? parsed.count : 0
    }
    await SecureStore.setItemAsync(AI_USAGE_KEY, JSON.stringify({ week: weekKey, count: count + 1 }))
}

type Props = {
    onClose?: () => void
    initialLatitude?: number
    initialLongitude?: number
    initialAddress?: string
}

const AddPlaceScreen = ({ onClose, initialLatitude, initialLongitude, initialAddress }: Props) => {
    const router = useRouter()

    const [showEdit, setShowEdit] = useState(false)
    const [photos, setPhotos] = useState<string[]>([])
    const [description, setDescription] = useState('')
    const [aiDraft, setAiDraft] = useState<{ draft: string; category: string } | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)

    const [visitDate, setVisitDate] = useState<Date | null>(null)
    const [locationAddress, setLocationAddress] = useState<string | null>(null)
    const [locationRegion, setLocationRegion] = useState<string | null>(null)
    const [locationName, setLocationName] = useState<string | null>(null)
    const [latitude, setLatitude] = useState<number | null>(null)
    const [longitude, setLongitude] = useState<number | null>(null)

    const [completedPlace, setCompletedPlace] = useState<any | null>(null)
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
    const [isPremium, setIsPremium] = useState(false)

    useEffect(() => {
        if (initialLatitude && initialLongitude) {
            setLatitude(initialLatitude)
            setLongitude(initialLongitude)
        }
        if (initialAddress) {
            setLocationAddress(initialAddress)
        }
        getMyPremium().then(res => {
            if (res.data?.data?.premium) setIsPremium(true)
        }).catch(() => {})
    }, [])

    const handleCreateWithAI = async () => {
        if (photos.length === 0) return alert('사진을 먼저 선택해주세요')
        if (!isPremium) {
            const allowed = await checkAiLimit()
            if (!allowed) return alert('이번 주 AI 초안 생성 횟수(5회)를 모두 사용했어요.\n구독하면 무제한으로 사용할 수 있어요!')
        }
        const fileInfo = await FileSystem.getInfoAsync(photos[0])
        if (!fileInfo.exists) {
            setPhotos([])
            return alert('사진 파일을 찾을 수 없어요. 앨범에서 다시 선택해 주세요.')
        }
        setIsGenerating(true)
        try {
            const uri = photos[0]
            const mimeType = uri.endsWith('.webp') ? 'image/webp' : uri.endsWith('.png') ? 'image/png' : 'image/jpeg'
            const presignedRes = await getPresignedUrl(mimeType)
            const presignedUrl = presignedRes.data?.presignedUrl
            const imageUrl = presignedRes.data?.imageUrl
            if (!presignedUrl || !imageUrl) throw new Error('presignedUrl 없음')
            await uploadToS3(presignedUrl, uri)
            const data = await generateAIDraft(imageUrl, description)
            setAiDraft(data)
            if (!isPremium) await incrementAiUsage()
        } catch (err: any) {
            console.error('[AI] 오류:', err?.message, err?.response?.status, JSON.stringify(err?.response?.data))
            alert('AI 초안 생성 중 오류가 발생했어요')
        } finally {
            setIsGenerating(false)
            setShowEdit(true)
        }
    }

    const fetchPlaceNameFromCoords = async (lat: number, lng: number) => {
        try {
            const response = await fetch(
                `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`,
                { headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` } }
            )
            const data = await response.json()
            if (data.documents && data.documents.length > 0) {
                const doc = data.documents[0]
                const roadAddress = doc.road_address?.address_name
                const jibunAddress = doc.address?.address_name
                setLocationName(roadAddress ?? jibunAddress ?? null)
            }
        } catch (err) {
            console.error('카카오 장소 검색 실패:', err)
        }
    }

    const extractFromExif = async (exif: any) => {
        try {
            console.log('[EXIF] raw keys:', Object.keys(exif ?? {}))

            if (exif?.DateTimeOriginal) {
                const raw = exif.DateTimeOriginal as string
                const [datePart, timePart] = raw.split(' ')
                const [year, month, day] = datePart.split(':')
                const parsed = new Date(`${year}-${month}-${day}T${timePart}`)
                if (!isNaN(parsed.getTime())) {
                    setVisitDate(parsed)
                    console.log('[EXIF] 날짜:', parsed.toISOString())
                } else {
                    console.warn('[EXIF] 날짜 파싱 실패:', raw)
                }
            } else {
                console.warn('[EXIF] DateTimeOriginal 없음')
            }

            if (exif?.GPSLatitude && exif?.GPSLongitude) {
                const toDegrees = (val: number | number[]) => {
                    if (Array.isArray(val)) return val[0] + val[1] / 60 + val[2] / 3600
                    return val
                }
                let lat = toDegrees(exif.GPSLatitude)
                let lng = toDegrees(exif.GPSLongitude)
                if (exif.GPSLatitudeRef === 'S') lat = -lat
                if (exif.GPSLongitudeRef === 'W') lng = -lng
                console.log(`[EXIF] GPS: lat=${lat}, lng=${lng} (raw: ${exif.GPSLatitude}, ${exif.GPSLongitude})`)

                setLatitude(lat)
                setLongitude(lng)

                const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng })
                if (place) {
                    console.log('[EXIF] reverseGeocode:', JSON.stringify(place))
                    const fullAddress = [place.city, place.district, place.street]
                        .filter(Boolean)
                        .join(' ')
                    setLocationAddress(fullAddress)
                    const geoAddress = [place.region, place.city, place.district].filter(Boolean).join(' ')
                    const matched = matchDistrictFromAddress(geoAddress)
                    console.log(`[EXIF] geoAddress="${geoAddress}" → matched="${matched ?? '없음'}"`)
                    if (matched) setLocationRegion(matched)
                }
                await fetchPlaceNameFromCoords(lat, lng)
            } else {
                console.warn('[EXIF] GPS 정보 없음')
            }
        } catch (err) {
            console.error('EXIF 추출 실패:', err)
        }
    }

    const openAlbum = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!permission.granted) {
            alert('앨범 접근 권한이 필요해요')
            return
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            allowsMultipleSelection: true,
            selectionLimit: 5,
            quality: 1,
            exif: true,
        })
        if (!result.canceled) {
            const persistentUris = await Promise.all(
                result.assets.map(async (a, i) => {
                    const dest = `${FileSystem.documentDirectory}photo_${Date.now()}_${i}.jpg`
                    await FileSystem.copyAsync({ from: a.uri, to: dest })
                    return dest
                })
            )
            setPhotos(persistentUris)
            const firstAsset = result.assets[0]
            if (firstAsset.exif) await extractFromExif(firstAsset.exif)
        }
    }

    const openCamera = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync()
        if (!permission.granted) {
            alert('카메라 권한이 필요해요')
            return
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            aspect: [4, 3],
            quality: 1,
            exif: true,
        })
        if (!result.canceled) {
            const asset = result.assets[0]
            const dest = `${FileSystem.documentDirectory}photo_${Date.now()}_0.jpg`
            await FileSystem.copyAsync({ from: asset.uri, to: dest })
            setPhotos(prev => [...prev, dest])
            if (asset.exif) await extractFromExif(asset.exif)
        }
    }

    if (completedPlace) {
        return (
            <PassportDetail
                item={completedPlace}
                onBack={() => setCompletedPlace(null)}
            />
        )
    }

    if (showEdit) {
        return (
            <EditPlaceScreen
                onBack={() => setShowEdit(false)}
                aiDraft={aiDraft}
                onComplete={() => {
                    Alert.alert(
                        '등록 완료',
                        '새 여권이 등록되었습니다! 🎉',
                        [{
                            text: '확인',
                            onPress: () => {
                                if (onClose) {
                                    onClose()
                                } else {
                                    router.replace('/(tabs)/passport')
                                }
                            },
                        }]
                    )
                }}
                photos={photos}
                description={description}
                visitDate={visitDate}
                locationAddress={locationAddress}
                locationRegion={locationRegion}
                locationName={locationName}
                latitude={latitude}
                longitude={longitude}
            />
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFD' }}>
        <KeyboardAvoidingView
            style={{flex: 1, backgroundColor: '#F8FAFD'}}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                style={{ flex: 1, width: '100%', backgroundColor: "#F8FAFD" }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
            <View style={{ marginTop: 10, alignSelf: 'center' }}>
            <Shadow
                distance={6}
                startColor={'#00000012'}
                offset={[0, 2]}
                style={{ width: CARD_WIDTH, marginBottom: 5, borderRadius: 16 }}
            >
                <View style={[styles.photoContainer, { height: screenHeight * 0.55 }]}>
                    <NoiseOverlay />
                    <View style={[styles.photoTextbox, { flexDirection: 'row', alignItems: 'center' }]}>
                        <TouchableOpacity
                            onPress={() => onClose ? onClose() : router.back()}
                            style={{ padding: 4, marginRight: 10, top: 7 }}
                        >
                            <Ionicons name="chevron-back" size={20} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.photoText}>장소의 사진을 등록해 주세요!</Text>
                    </View>

                    {photos.length > 1 ? (
                        <View style={styles.albumButton}>
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
                            <View style={styles.photoIndicatorRowAdd}>
                                {photos.map((_, index) => (
                                    <View
                                        key={index}
                                        style={index === currentPhotoIndex
                                            ? editStyles.photoIndicatorDotActive
                                            : editStyles.photoIndicatorDot
                                        }
                                    />
                                ))}
                            </View>
                            <TouchableOpacity
                                style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}
                                onPress={openAlbum}
                            >
                                <Text style={{ color: '#fff', fontSize: 12 }}>재선택</Text>
                            </TouchableOpacity>
                        </View>
                    ) : photos.length === 1 ? (
                        <TouchableOpacity
                            style={styles.albumButton}
                            onPress={openAlbum}
                        >
                            <Image
                                source={{ uri: photos[0] }}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.albumButtonEmpty}
                            onPress={openAlbum}
                        >
                            <Text style={{ color: '#aaa' }}>앨범에서 선택하기</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={openCamera}
                    >
                        <Text style={[styles.clickText, { fontSize: 12 }]}>카메라로 촬영</Text>
                    </TouchableOpacity>
                </View>
            </Shadow>
            </View>

            <Shadow
                distance={6}
                startColor={'#00000012'}
                offset={[0, 2]}
                style={{ width: CARD_WIDTH, borderRadius: 16 }}
            >
                <View style={[styles.infoContainer, { height: screenHeight * 0.2 }]}>
                    <NoiseOverlay />
                    <View style={styles.infoTextbox}>
                        <Text style={styles.infotitleText}>어떤 곳인지 간단히 설명해 주세요.</Text>
                    </View>
                    <View style={styles.infoTypeBox}>
                        <TextInput
                            style={styles.infoTypeText}
                            placeholder="카페에 가서 커피를 마셨다!"
                            placeholderTextColor="#666666"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />
                    </View>
                </View>
            </Shadow>

            <TouchableOpacity
                style={styles.clickContainer}
                onPress={handleCreateWithAI}
                disabled={isGenerating}
            >
                <Text style={styles.clickText}>
                    {isGenerating ? 'AI 작성 중...' : '기록 생성하기 with AI'}
                </Text>
            </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    </View>
    )
}

export default AddPlaceScreen
