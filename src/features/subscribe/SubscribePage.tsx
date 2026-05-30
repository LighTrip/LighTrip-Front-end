import {
    Text,
    TouchableOpacity,
    View,
    Image,
    Platform,
    Modal,
    Alert,
} from "react-native";
import Animated, { useSharedValue, withTiming, useAnimatedRef, scrollTo, runOnUI } from 'react-native-reanimated'
import { WebView } from 'react-native-webview'
import { useRouter } from 'expo-router'
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { subscribeStyles as styles } from './subscribeStyles';

export default function SubscribePage() {
    const router = useRouter()

    const plans = ['기본 플랜', '월간 구독', '연간 구독']
    const planLabels = ['ECONOMY CLASS', 'BUSINESS CLASS', 'BUSINESS CLASS']
    const bannerColors = ['#FFD9A7', '#8FB88A', '#8FB88A']

    const [selectedIndex, setSelectedIndex] = useState<number | null>(0)
    const [qnaVisible, setQnaVisible] = useState(false)
    const [subscribeBoxY, setSubscribeBoxY] = useState(0)

    const animatedRef = useAnimatedRef<Animated.ScrollView>()

    const handleScrollTo = (y: number) => {
        runOnUI(() => {
            scrollTo(animatedRef, 0, y, true)
        })()
    }

    const qnaUrl = Platform.OS === 'ios'
        ? 'https://support.apple.com/ko-kr/118428'
        : 'https://support.google.com/googleplay/answer/7018481'

    return (
        <View style={styles.container}>
            <View style={styles.topBox}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.topText}>나의 구독</Text>

                <View style={styles.topLine}>
                    <Text style={styles.departure}>LTP</Text>
                    <Ionicons name="airplane-sharp" size={30} color="#FFFFFF" style={{ marginLeft: 10 }} />
                    <Text style={styles.destination}>ME</Text>
                </View>

                <View style={styles.dotLine}>
                    {Array.from({ length: 50 }).map((_, i) => (
                        <View key={i} style={styles.dot} />
                    ))}
                </View>

                <View style={styles.classLine}>
                    <Text style={styles.classText}>클래스</Text>
                    <View style={[styles.classBanner, { backgroundColor: bannerColors[selectedIndex ?? 0] }]}>
                        <Text style={styles.classBannerText}>{planLabels[selectedIndex ?? 0]}</Text>
                    </View>
                </View>
            </View>

            <Animated.ScrollView
                ref={animatedRef}
                style={{ width: '100%', marginBottom: -20 }}
                contentContainerStyle={{ alignItems: 'center', paddingBottom: 25 }}
            >
                <View style={styles.textContainer}>
                    <Text style={styles.textContent}>구독</Text>
                </View>

                <View style={styles.ticketContainer}>
                    {[
                        { header: styles.economyticketHeader, label: 'ECONOMY CLASS                                                   LTP', text: '기본 플랜' },
                        { header: styles.businessticketHeader, label: 'BUSINESS CLASS                                                   LTP', text: '월간 구독: 4,900원' },
                        { header: styles.businessticketHeader, label: 'BUSINESS CLASS                                                   LTP', text: '연간 구독: 49,000' },
                    ].map((ticket, index) => (
                        <TouchableOpacity
                            key={index}
                            style={{ width: '100%', alignItems: 'center' }}
                            onPress={() => setSelectedIndex(index === selectedIndex ? null : index)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.ticketBox}>
                                <View style={ticket.header}>
                                    <Text style={styles.ticketHeaderText}>{ticket.label}</Text>
                                </View>
                                <Image source={require('../../../assets/ticket/barcode.png')} style={styles.barcode} />
                                <Text style={styles.ticketText}>{ticket.text}</Text>
                                <View style={styles.tearTop} />
                                <View style={styles.tearDown} />
                                <View style={styles.tearLine} />
                                {selectedIndex === index && (
                                    <Image
                                        source={require('../../../assets/icons/paymentStamp.png')}
                                        style={styles.checkBadge}
                                    />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.textContainer}
                    onPress={() => handleScrollTo(subscribeBoxY - 22)}
                >
                    <Text style={styles.textContent}>구독 기능 상세보기</Text>
                    <Ionicons name="caret-down" size={16} color="#000" style={{ marginTop: 5 }} />
                </TouchableOpacity>

                <View
                    onLayout={(e) => setSubscribeBoxY(e.nativeEvent.layout.y)}
                    style={styles.subscribeBox}
                >
                    {[
                        '광고 제거',
                        '테마 변경',
                        '사진 여러 장',
                        'AI 초안 기능 무제한',
                        '팀 만들기',
                    ].map((item, index, arr) => (
                        <View key={index}>
                            <View style={styles.subscribeItem}>
                                <Text style={styles.subscribeItemText}>{item}</Text>
                            </View>
                            {index < arr.length - 1 && (
                                <View style={{ position: 'relative' }}>
                                    <View style={[styles.notch, { left: -10 }]} />
                                    <View style={styles.itemDivider} />
                                    <View style={[styles.notch, { right: -10 }]} />
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.scrollTopContainer}
                    onPress={() => handleScrollTo(0)}
                >
                    <Ionicons name="caret-up" size={16} color="#000000" />
                    <Text style={styles.scrollTopText}>구독 플랜 보러 가기</Text>
                </TouchableOpacity>

                <View style={styles.qnaContainer}>
                    <Text style={styles.endText}>
                        정기 결제 취소는 어떻게 하나요?{'  '}
                        <Text style={styles.qnaText} onPress={() => setQnaVisible(true)}>자세히</Text>
                    </Text>

                    <Modal visible={qnaVisible} animationType="slide" onRequestClose={() => setQnaVisible(false)}>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity
                                onPress={() => setQnaVisible(false)}
                                style={{ padding: 10, paddingTop: 60, backgroundColor: '#1A3A6B' }}
                            >
                                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                            <WebView source={{ uri: qnaUrl }} />
                        </View>
                    </Modal>
                </View>
            </Animated.ScrollView>

            <TouchableOpacity 
                style={styles.payButton}
                onPress={() => {
                    if (selectedIndex === 0) {
                        Alert.alert('안내', '기본 플랜은 무료예요!')
                        return
                    }
                    Alert.alert(
                        '결제 준비 중',
                        `${plans[selectedIndex ?? 0]} 결제 기능은 준비 중이에요.`,
                        [{ text: '확인' }]
                    )
                }}
            >
                <Text style={styles.payButtonText}>결제하기</Text>
            </TouchableOpacity>     
        </View>
    )
}