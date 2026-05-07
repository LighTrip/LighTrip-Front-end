import { 
    StatusBar, 
    StyleSheet, 
    Text, 
    View, 
    TouchableOpacity, 
    Image, 
    ScrollView,
    Dimensions
} from 'react-native'
import React from 'react'

type Place = {
    id: string;
    name: string;
    image: any;
    district: string;
    date: string;
    category: string;
}

type Props = {
    item: Place;
    onBack: () => void;
}

const DUMMY = {
    visitCount: 1,
    review: '마포구에서 맛있는 커피를 파는 카페를 찾았다! 케이크도 있었는데 다음에 가면 케이크도 꼭 먹어 봐야겠다는 생각이 들었다. 🍰',
    nickname: '멍냥',
    handle: 'KiiiKiii',
    placeImage: require('../../../../assets/images/profile1.jpg'),
}

const { width } = Dimensions.get('window')

const PassportDetail = ({ item, onBack }: Props) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

        {/* 상단 헤더 */}
        <View style={styles.headerCard}>
            <Text style={styles.districtTitle}>{item.district}구</Text>
            <Text style={styles.visitText}>{item.district}구를 {DUMMY.visitCount}번 탐험했어요 ♪</Text>
        </View>

        {/* 여권 카드 (위아래 통합) */}
        <View style={styles.passportCard}>

            {/* 윗부분 */}
            <View style={styles.topHalf}>
                {/* X 버튼 */}
                <TouchableOpacity onPress={onBack} style={styles.closeButton}>
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>

                {/* 테이프 */}
                <Image 
                    source={require('../../../../assets/images/pinktape.png')} 
                    style={styles.tape} 
                    resizeMode="contain" 
                />

                {/* 사진 */}
                <Image source={item.image} style={styles.placeImage} resizeMode="cover" />

                {/* 도장 */}
                <Image 
                    source={require('../../../../assets/images/StampSeal.png')} 
                    style={styles.stampImage} 
                    resizeMode="contain" 
                />

                {/* 정보 */}
                <View style={styles.infoArea}>
                    <Text style={styles.infoRow}>🏷 {item.category}</Text>
                    <Text style={styles.infoRow}>📍 {item.name}</Text>
                    <Text style={styles.infoRow}>🗓 {item.date}</Text>
                </View>
            </View>

            {/* 구분선 */}
            <View style={styles.dividerRow}>
                <View style={styles.dividerCircleLeft} />
                <View style={styles.dividerLine} />
                <View style={styles.dividerCircleRight} />
            </View>

            {/* 아랫부분 */}
            <View style={styles.bottomHalf}>
                <View style={styles.reviewBox}>
                    <Text style={styles.reviewText}>{DUMMY.review}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Image source={DUMMY.placeImage} style={styles.musicImage} />
                    <View>
                        <Text style={styles.nickname}>{DUMMY.nickname}</Text>
                        <Text style={styles.handle}>{DUMMY.handle}</Text>
                    </View>
                </View>

                <View style={styles.editBox}>
                    <Text style={styles.editText}>{'<<<<<<<<<<<<<< edit my passport >>>>>>>>>>>>>>'}</Text>
                </View>
            </View>
        </View>

    </ScrollView>
  )
}

export default PassportDetail

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFD',
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
        height: 650,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },

    topHalf: {
        padding: 20,
        paddingTop: 30,
        minHeight: 325,
        justifyContent: 'flex-start',
    },

    bottomHalf: {
        padding: 20,
        minHeight: 325,
        justifyContent: 'space-between',
        gap: 0,
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
        top: 24,
        left: width * 0.27,
        width: 100,
        height: 50,
        zIndex: 5,
    },

    placeImage: {
        width: 170,
        height: 260,
        borderRadius: 4,
        transform: [{ rotate: '-4deg' }],
        marginBottom: 10,
        marginTop: 10,
    },

    stampImage: {
        position: 'absolute',
        top: 30,
        right: 15,
        width: 170,
        height: 170,
    },

    infoArea: {
        position: 'absolute',
        bottom: 50,
        right: 30,
        gap: 8,
    },

    infoRow: {
        fontSize: 15,
        color: '#444',
        fontFamily: 'Griun_Gellyroll',
    },

    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    dividerCircleLeft: {
        width: 2,
        height: 2,
        borderRadius: 12,
        backgroundColor: '#FAF7F4',
        marginLeft: -12,
    },

    dividerCircleRight: {
        width: 2,
        height: 2,
        borderRadius: 12,
        backgroundColor: '#FAF7F4',
        marginRight: -12,
    },

    dividerLine: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderStyle: 'solid',
    },

    reviewBox: {
        borderRadius: 12,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
    },

    reviewText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        lineHeight: 28,
        width: '95%',
        fontFamily: 'Griun_Gellyroll',
    },

    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 0,    
    },

    profileImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginLeft: 50,
    },

    musicImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginLeft: 20,
    },

    nickname: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
        marginLeft: 10,
    },

    handle: {
        fontSize: 13,
        color: '#888',
        marginLeft: 10,
    },

    editBox: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 0,   
    },

    editText: {
        textAlign: 'center',
        fontSize: 13,
        color: '#bbb',
        fontFamily: 'SpaceMono',
    },
})