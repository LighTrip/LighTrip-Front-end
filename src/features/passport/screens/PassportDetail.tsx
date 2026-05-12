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
} from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'

import NoiseOverlay from '@/src/components/common/NoiseOverlay'

type Place = {
    id: string;
    name: string;
    image: any;
    district: string;
    date: string;
    category: string;
}

type Props = {
    item: Place
    onBack: () => void
    onNext?: () => void
    onPrev?: () => void
}

const DUMMY = {
    visitCount: 1,
    review: '마포구에서 맛있는 커피를 파는 카페를 찾았다! 케이크도 있었는데 다음에 가면 케이크도 꼭 먹어 봐야겠다는 생각이 들었다. 🍰',
    musicTitle: '멍냥',
    artist: 'KiiiKiii',
    placeImage: require('../../../../assets/images/profile1.jpg'),
}

const PLACE_TYPES = ['☕ 카페', '🍽️ 식당', '🍶 술집', '🏞️ 공원', '🎬 문화', '🏋️ 운동', '🛍️ 쇼핑', '📦 기타']

const { width } = Dimensions.get('window')

const PassportDetail = ({ item, onBack, onNext, onPrev }: Props) => {

    const [isEditing, setIsEditing] = useState(false)
    const [editReview, setEditReview] = useState(DUMMY.review)
    const [editCategory, setEditCategory] = useState(item.category)
    const [editDate, setEditDate] = useState(new Date(item.date))
    const [editMusic, setEditMusic] = useState<{ title: string, artist: string, artwork: string } | null>(null)
    const [isCover, setIsCover] = useState(false)

    const [musicSearch, setMusicSearch] = useState('')
    const [musicResults, setMusicResults] = useState<any[]>([])
    const [musicModalOpen, setMusicModalOpen] = useState(false)
    const [categoryOpen, setCategoryOpen] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState(false)

    const formatDate = (date: Date) => {
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
    }

    const searchMusic = async (query: string) => {
        if (!query.trim()) return
        const response = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=10`
        )
        const data = await response.json()
        setMusicResults(data.results)
    }

    return (
        <View style={[styles.container, styles.scrollContent]}>

            {/* 상단 헤더 */}
            <View style={styles.headerCard}>
                <NoiseOverlay />
                <Text style={styles.districtTitle}>{item.district}구</Text>
                <Text style={styles.visitText}>{item.district}구를 {DUMMY.visitCount}번 탐험했어요 ♪</Text>
            </View>

            {/* 여권 카드 */}
            <View style={styles.passportCard}>
                <NoiseOverlay />

                {/* 윗부분 */}
                <View style={styles.topHalf}>
                    <TouchableOpacity onPress={onBack} style={styles.closeButton}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>

                    <Image source={require('../../../../assets/images/pinktape.png')} style={styles.tape} resizeMode="contain" />
                    
                    <View>
                        <Image source={item.image} style={styles.placeImage} resizeMode="cover" />
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

                    <Image source={require('../../../../assets/images/StampSeal.png')} style={styles.stampImage} resizeMode="contain" />

                    {/* 정보 */}
                    <View style={styles.infoArea}>
                        {/* 카테고리 */}
                        <View style={styles.infoRow}>
                            <Image source={require('../../../../assets/icons/category.png')} style={styles.icon} resizeMode="contain"/>
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
                            <Text style={styles.infoText}>{item.name}</Text>
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

                        {showDatePicker && (
                            <DateTimePicker
                                value={editDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'compact' : 'calendar'}
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false)
                                    if (selectedDate) setEditDate(selectedDate)
                                }}
                            />
                        )}
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
                            ) : (
                                <>
                                    <Image source={DUMMY.placeImage} style={styles.musicImage} />
                                    <View>
                                        <Text style={styles.musicTitle}>{DUMMY.musicTitle}</Text>
                                        <Text style={styles.artist}>{DUMMY.artist}</Text>
                                    </View>
                                    <Image source={require('../../../../assets/icons/edit.png')} style={{ marginLeft: 'auto', marginRight: 12 }} />
                                </>
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
                            ) : (
                                <>
                                    <Image source={DUMMY.placeImage} style={styles.musicImage} />
                                    <View>
                                        <Text style={styles.musicTitle}>{DUMMY.musicTitle}</Text>
                                        <Text style={styles.artist}>{DUMMY.artist}</Text>
                                    </View>
                                </>
                            )}
                        </View>
                    )}

                    {/* edit / save 버튼 */}
                    <View style={styles.editBox}>
                        <TouchableOpacity onPress={onPrev}>
                            <Text style={styles.editText}>{'<<<<<<<<<<<<<<<<'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                            <Text style={styles.editText}>{isEditing ? 'save passport' : 'edit my passport'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onNext}>
                            <Text style={styles.editText}>{'>>>>>>>>>>>>>>>>'}</Text>
                        </TouchableOpacity>
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

            {/* 음악 검색 모달 */}
            <Modal visible={musicModalOpen} transparent animationType="slide" onRequestClose={() => setMusicModalOpen(false)}>
                <TouchableOpacity style={styles.modalBackdrop} onPress={() => setMusicModalOpen(false)} activeOpacity={1}>
                    <View style={styles.musicModalBox}>
                        <View style={styles.musicSearchBox}>
                            <Image source={require('../../../../assets/icons/edit.png')}/>
                            <TextInput
                                style={styles.musicSearchInput}
                                placeholder="곡 제목이나 아티스트 검색"
                                placeholderTextColor="#aaa"
                                value={musicSearch}
                                onChangeText={(text) => { setMusicSearch(text); searchMusic(text) }}
                                autoFocus
                            />
                        </View>
                        <FlatList
                            data={musicResults}
                            keyExtractor={(i) => i.trackId.toString()}
                            renderItem={({ item: track }) => (
                                <TouchableOpacity
                                    style={styles.musicResultItem}
                                    onPress={() => {
                                        setEditMusic({ title: track.trackName, artist: track.artistName, artwork: track.artworkUrl100 })
                                        setMusicModalOpen(false)
                                        setMusicSearch('')
                                        setMusicResults([])
                                    }}
                                >
                                    <Image source={{ uri: track.artworkUrl100 }} style={styles.musicResultArt} />
                                    <View style={styles.musicResultInfo}>
                                        <Text style={styles.musicResultTitle} numberOfLines={1}>{track.trackName}</Text>
                                        <Text style={styles.musicResultArtist} numberOfLines={1}>{track.artistName}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

        </View>
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
        overflow: 'hidden',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
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
        height: 655,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        paddingBottom: 20,
    },

    topHalf: {
        padding: 20,
        paddingTop: 30,
        minHeight: 325,
        justifyContent: 'flex-start',
    },

    bottomHalf: {
        padding: 20,
        minHeight: 200,
        justifyContent: 'space-between',
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
        top: 40,
        left: width * 0.3,
        width: 100,
        height: 50,
        zIndex: 5,
    },

    placeImage: {
        width: 170,
        height: 260,
        left: 5,
        borderRadius: 4,
        transform: [{ rotate: '-4deg' }],
        marginBottom: 10,
        marginTop: 10,
        top: 10,
    },

    coverBadge: {
        position: 'absolute',
        bottom: 275,
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
        top: 30,
        right: 10,
        width: 170,
        height: 170,
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
        left: 110,
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
        position: 'absolute',
        width: '100%',
        borderRadius: 12,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 55,
        marginLeft: 20,
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
        position: 'absolute',
        width: '100%',
        height: 120,
        borderRadius: 16,
        padding: 20,
        fontSize: 16,
        lineHeight: 28,
        alignContent: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        fontFamily: 'Griun_Gellyroll',
        marginTop: 90,
    },

    musicBox: {
        position: 'absolute',
        flexDirection: 'row',
        height: 80,
        width: '100%',
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#ffffff',
        marginTop: 200,
        marginLeft: 20,
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
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 296,
        marginLeft: 27,
        gap: 5,
    },

    editText: {
        width: 110,
        textAlign: 'center',
        fontSize: 13,
        color: '#757575',
        fontFamily: 'SpaceMono',
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
})