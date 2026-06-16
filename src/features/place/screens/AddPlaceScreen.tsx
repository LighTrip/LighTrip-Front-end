import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import { useRouter } from 'expo-router'
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
import { Ionicons } from '@expo/vector-icons'

import NoiseOverlay from '@/src/components/common/NoiseOverlay'
import EditPlaceScreen from './EditPlaceScreen'
import PassportDetail from '../../passport/screens/PassportDetail'
import { REGIONS } from '@/src/constant/regions'
import { generateAIDraft } from '@/src/api/passport/ai.api'

import { addStyles as styles, editStyles } from '../components/placeStyles'

const { width, height: screenHeight } = Dimensions.get('window')
export const CARD_WIDTH = width * 0.91

const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY

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

    useEffect(() => {
        if (initialLatitude && initialLongitude) {
            setLatitude(initialLatitude)
            setLongitude(initialLongitude)
        }
        if (initialAddress) {
            setLocationAddress(initialAddress)
        }
    }, [])

    const handleCreateWithAI = async () => {
        if (photos.length === 0) return alert('사진을 먼저 선택해주세요')
        setIsGenerating(true)
        try {
            const data = await generateAIDraft(photos[0], description)
            setAiDraft(data)
        } catch (err) {
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
            if (exif?.DateTimeOriginal) {
                const raw = exif.DateTimeOriginal as string
                const [datePart, timePart] = raw.split(' ')
                const [year, month, day] = datePart.split(':')
                const parsed = new Date(`${year}-${month}-${day}T${timePart}`)
                if (!isNaN(parsed.getTime())) setVisitDate(parsed)
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

                setLatitude(lat)
                setLongitude(lng)

                const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng })
                if (place) {
                    const fullAddress = [place.city, place.district, place.street]
                        .filter(Boolean)
                        .join(' ')
                    setLocationAddress(fullAddress)
                    if (place.district) {
                        const allDistricts = Object.values(REGIONS).flat()
                        const matched = allDistricts.find(r => place.district!.includes(r))
                        if (matched) setLocationRegion(matched)
                    }
                }
                await fetchPlaceNameFromCoords(lat, lng)
            }
        } catch (err) {
            console.error('EXIF 추출 실패:', err)
        }
        await fetchPlaceNameFromCoords(lat, lng);
      }
    } catch (err) {
      console.error("EXIF 추출 실패:", err);
    }
  };

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
            const uris = result.assets.map(a => a.uri)
            setPhotos(uris)
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
            setPhotos(prev => [...prev, asset.uri])
            if (asset.exif) await extractFromExif(asset.exif)
        }
    }
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert("카메라 권한이 필요해요");
      return;
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
  };

  if (completedPlace) {
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
                <View style={[styles.photoContainer, { height: screenHeight * 0.56 }]}>
                    <NoiseOverlay />
                    <View style={[styles.photoTextbox, { flexDirection: 'row', alignItems: 'center' }]}>
                        <TouchableOpacity
                            onPress={() => onClose ? onClose() : router.back()}
                            style={{ padding: 4, marginRight: 4 }}
                        >
                            <Ionicons name="chevron-back" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.photoText}>장소의 사진을 등록해 주세요!</Text>
                    </View>

                    {photos.length > 1 ? (
                        <View style={[styles.albumButton, { width: CARD_WIDTH * 0.91, height: screenHeight * 0.37 }]}>
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
                            style={[styles.albumButton, { width: CARD_WIDTH * 0.91, height: screenHeight * 0.37 }]}
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
                            style={[styles.albumButtonEmpty, { width: CARD_WIDTH * 0.91, height: screenHeight * 0.37 }]}
                            onPress={openAlbum}
                        >
                            <Text style={{ color: '#aaa' }}>앨범에서 선택하기</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.cameraButton, { width: CARD_WIDTH * 0.67 }]}
                        onPress={openCamera}
                    >
                        <Text style={styles.clickText}>카메라로 촬영</Text>
                    </TouchableOpacity>
                </View>
            </Shadow>

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
                    <View style={[styles.infoTypeBox, { width: CARD_WIDTH * 0.91, height: screenHeight * 0.095 }]}>
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
                style={[styles.clickContainer, { marginBottom: 20 }]}
                onPress={handleCreateWithAI}
                disabled={isGenerating}
            >
                <Text style={styles.clickText}>
                    {isGenerating ? 'AI 작성 중...' : '기록 생성하기 with AI'}
                </Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    )
}

export default AddPlaceScreen
