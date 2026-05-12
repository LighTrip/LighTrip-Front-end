import { 
    StatusBar, 
    StyleSheet, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    Image,
    Dimensions,
    View,
    Modal,
    FlatList,
    Switch,
    Platform,
} from 'react-native'
import React, { useState } from 'react'
import { Shadow } from 'react-native-shadow-2'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import NoiseOverlay from '@/src/components/common/NoiseOverlay'
import Dropdown from '@/src/components/common/Dropdown'

const { width } = Dimensions.get('window')
const CARD_WIDTH = width * 0.91

const PLACE_TYPES = ['☕ 카페', '🍽️ 식당', '🍶 술집', '🏞️ 공원', '🎬 문화', '🏋️ 운동', '🛍️ 쇼핑', '📦 기타']
const REGIONS = [
    '강남구', '강동구', '강북구', '강서구', '관악구',
    '광진구', '구로구', '금천구', '노원구', '도봉구',
    '동대문구', '동작구', '마포구', '서대문구', '서초구',
    '성동구', '성북구', '송파구', '양천구', '영등포구',
    '용산구', '은평구', '종로구', '중구', '중랑구'
]

const InfoRow = ({ iconName, text }: { iconName: string, text: string }) => (
    <View style={styles.infoRowWrapper}>
        <View style={styles.infoRow}>
            <Ionicons name={iconName as any} size={18} color="#4A6FA5" />
            <Text style={styles.infoText}>{text}</Text>
        </View>
        <View style={styles.divider} />
    </View>
)

type Props = {
    onBack: () => void
    photo: string | null
}

const EditPlaceScreen = ({ onBack, photo }: Props) => {

    const [date, setDate] = useState(new Date())
    const [showDatePicker, setShowDatePicker] = useState(false)

    const formatDate = (date: Date) => {
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
    }

    const [placeType, setPlaceType] = useState('☕ 카페')
    const [region, setRegion] = useState('용산구')

    const [content, setContent] = useState('')
    const [isPublic, setIsPublic] = useState(true)

    const [music, setMusic] = useState<{ title: string, artist: string, artwork: string } | null>(null)
    const [musicSearch, setMusicSearch] = useState('')
    const [musicResults, setMusicResults] = useState<any[]>([])
    const [musicModalOpen, setMusicModalOpen] = useState(false)

    const searchMusic = async (query: string) => {
        if (!query.trim()) return
            const response = await fetch(
                `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=10`
        )
        const data = await response.json()
        setMusicResults(data.results)
    }

    return (
        <View style={styles.container}>
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
                        <InfoRow iconName="location-outline" text="서울시 여의도 한강공원" />
                        
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            <View style={styles.infoRowWrapper}>
                                <View style={styles.infoRow}>
                                    <Ionicons name="calendar-outline" size={18} color="#4A6FA5" />
                                    <Text style={styles.infoText}>{formatDate(date)}</Text>
                                </View>
                                <View style={styles.divider} />
                            </View>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'compact' : 'calendar'}
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false)
                                    if (selectedDate) setDate(selectedDate)
                                }}
                            />
                        )}
                    </View>

                    {/* 드롭다운 2개 */}
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
                            options={REGIONS}
                            onSelect={setRegion}
                        />
                    </View>

                    <View style={styles.contentSection}>
                        <Text style={styles.contentLabel}>내용</Text>
                        <TextInput
                            style={styles.contentInput}
                            multiline
                            placeholder="내용을 입력하세요"
                            placeholderTextColor="#aaa"
                            value={content}
                            onChangeText={setContent}
                        />
                    </View>
                    
                    {/* 뮤직카드 */}
                    <TouchableOpacity style={styles.musicCard} onPress={() => setMusicModalOpen(true)}>
                        {music ? (
                            <>
                                <Image source={{ uri: music.artwork }} style={styles.albumArt} />
                                <View style={styles.musicInfo}>
                                    <Text style={styles.musicTitle}>{music.title}</Text>
                                    <Text style={styles.musicArtist}>{music.artist}</Text>
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
                    <Modal
                        visible={musicModalOpen}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setMusicModalOpen(false)}
                    >
                        <TouchableOpacity
                            style={styles.modalBackdrop}
                            onPress={() => setMusicModalOpen(false)}
                            activeOpacity={1}
                        >
                            <View style={styles.musicModalBox}>
                                {/* 검색창 */}
                                <View style={styles.musicSearchBox}>
                                    <Ionicons name="search-outline" size={18} color="#aaa" />
                                    <TextInput
                                        style={styles.musicSearchInput}
                                        placeholder="곡 제목이나 아티스트 검색"
                                        placeholderTextColor="#aaa"
                                        value={musicSearch}
                                        onChangeText={(text) => {
                                            setMusicSearch(text)
                                            searchMusic(text)
                                        }}
                                        autoFocus
                                    />
                                </View>

                                {/* 결과 목록 */}
                                <FlatList
                                    data={musicResults}
                                    keyExtractor={(item) => item.trackId.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.musicResultItem}
                                            onPress={() => {
                                                setMusic({
                                                    title: item.trackName,
                                                    artist: item.artistName,
                                                    artwork: item.artworkUrl100,
                                                })
                                                setMusicModalOpen(false)
                                                setMusicSearch('')
                                                setMusicResults([])
                                            }}
                                        >
                                            <Image
                                                source={{ uri: item.artworkUrl100 }}
                                                style={styles.musicResultArt}
                                            />
                                            <View style={styles.musicResultInfo}>
                                                <Text style={styles.musicResultTitle} numberOfLines={1}>
                                                    {item.trackName}
                                                </Text>
                                                <Text style={styles.musicResultArtist} numberOfLines={1}>
                                                    {item.artistName}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        </TouchableOpacity>
                    </Modal>
                    
                    <View style={styles.publicRow}>
                        <View>
                            <Text style={styles.publicTitle}>여권 공개 여부</Text>
                            <Text style={styles.publicSub}>{isPublic ? '모든 사람이 볼 수 있어요' : '나만 볼 수 있어요'}</Text>
                        </View>
                        <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ false: '#D0D0D0', true: '#1A3A6B' }} thumbColor={'#FFFFFF'} />
                    </View>

                </View>
            </Shadow>

            <TouchableOpacity style={styles.clickContainer}>
                <Text style={styles.clickText}>등록하기</Text>
            </TouchableOpacity>
        </View>
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
        marginTop: 20, 
    },

    logContainer: {
        height: 705,
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
        height: 230,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
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
    },

    divider: {
        height: 1,
        backgroundColor: '#4B4B4B',
    },

    dropdownRow: {
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: 16,
        gap: 12,
        marginTop: 16,
    },

    modalBackdrop: {
        flex: 1,
        backgroundColor: '#00000040',
        justifyContent: 'center',
        alignItems: 'center',
    },

    contentSection: {
        width: '100%',
        paddingHorizontal: 16,
        marginTop: 10,
        gap: 8,
    },

    contentLabel: {
        fontSize: 13,
        color: '#555',
        fontWeight: '500',
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
        marginTop: 20,
        gap: 12,
    },

    albumArt: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#ddd',
    },

    musicInfo: { gap: 4 },

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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
        marginTop: 10,
        paddingHorizontal: 4,
        gap: 12,
        marginRight: 15,
    },

    publicTextBox: {
        gap: 4,
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
        marginBottom: 20,
    },

    clickText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
})