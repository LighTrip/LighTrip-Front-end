import {
    Text,
    TouchableOpacity,
    View,
    Image,
    Platform,
    Modal,
    Alert,
    Linking,
    Animated as RNAnimated,
} from "react-native";
import Animated, { useAnimatedRef, scrollTo, runOnUI } from 'react-native-reanimated'
import { WebView } from 'react-native-webview'
import { useRouter } from 'expo-router'
import { useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { createOrder, confirmPayment, getMyPremium } from '@/src/api/payment/payment.api'

import { subscribeStyles as styles } from '../components/subscribeStyles';

export default function SubscribePage() {
    const router = useRouter()

    const [webViewUrl, setWebViewUrl] = useState<string | null>(null)
    const TOSS_CLIENT_KEY = process.env.EXPO_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY ?? ''
    const SUCCESS_URL = 'https://lightrip.app/payment/success'
    const FAIL_URL = 'https://lightrip.app/payment/fail'

    const [paidIndex, setPaidIndex] = useState<number | null>(null)
    const planLabels = ['ECONOMY CLASS', 'BUSINESS CLASS', 'BUSINESS CLASS']
    const bannerColors = ['#FFD9A7', '#8FB88A', '#8FB88A']

    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const [qnaVisible, setQnaVisible] = useState(false)
    const [subscribeBoxY, setSubscribeBoxY] = useState(0)

    const [businessExpanded, setBusinessExpanded] = useState(false)
    const expandAnim = useRef(new RNAnimated.Value(0)).current

    const animatedRef = useAnimatedRef<Animated.ScrollView>()

    useEffect(() => {
        const fetchPremium = async () => {
            try {
                const res = await getMyPremium()
                if (res.data.data.premium) {
                    setPaidIndex(1)
                }
            } catch (_err) {
                // intentionally ignored
            }
        }
        fetchPremium()
    }, [])

    const toggleBusiness = () => {
        const toValue = businessExpanded ? 0 : 1
        setBusinessExpanded(!businessExpanded)
        RNAnimated.spring(expandAnim, {
            toValue,
            useNativeDriver: false,
        }).start()
    }

    const cardHeight = expandAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 190],
    })

    const handlePayment = async () => {
        if (selectedIndex === 0) {
            Alert.alert('안내', '기본 플랜은 무료예요!')
            return
        }
        const productType = selectedIndex === 1 ? 'PREMIUM_1MONTH' : 'PREMIUM_1YEAR'
        try {
            const res = await createOrder(productType)
            const { orderId, amount, orderName } = res.data.data
            const params = new URLSearchParams({
                ck: TOSS_CLIENT_KEY,
                amount: String(amount),
                orderId,
                orderName,
                successUrl: SUCCESS_URL,
                failUrl: FAIL_URL,
            })
            setWebViewUrl(`https://glittery-queijadas-dc180c.netlify.app/checkout.html?${params.toString()}`)
        } catch (_err) {
            Alert.alert('오류', '주문 생성에 실패했어요.')
        }
    }

    const handleConfirmPayment = async (paymentKey: string, orderId: string, amount: number) => {
        try {
            await confirmPayment(paymentKey, orderId, amount)
            await getMyPremium()
            setPaidIndex(selectedIndex)
            setWebViewUrl(null)
            Alert.alert('결제 완료', '구독이 시작되었어요! 🎉')
        } catch (_err) {
            Alert.alert('오류', '결제 확인에 실패했어요.')
            setWebViewUrl(null)
        }
    }

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
                    <View style={[styles.classBanner, { backgroundColor: bannerColors[paidIndex ?? 0] }]}>
                        <Text style={styles.classBannerText}>{planLabels[paidIndex ?? 0]}</Text>
                    </View>
                </View>
            </View>

            <Animated.ScrollView
                ref={animatedRef}
                style={{ width: '100%', marginBottom: -20 }}
                contentContainerStyle={{ alignItems: 'center', paddingBottom: 25 }}
            >
                <View style={styles.textContainerTop}>
                    <Text style={styles.textContentBottom}>구독</Text>
                </View>

                <View style={styles.ticketContainer}>
                    {[
                        { header: styles.economyticketHeader, label: 'ECONOMY CLASS', plan: '기본', ticketIndex: 0, price: '무료', seat: 'BASIC' },
                        { header: styles.businessticketHeader, label: 'BUSINESS CLASS', plan: '구독', ticketIndex: 1, price: '4,900~', seat: 'VIP' },
                    ].map((ticket, index) => {
                        const isStamped = selectedIndex !== null
                            ? (ticket.ticketIndex === 1 ? (selectedIndex === 1 || selectedIndex === 2) : selectedIndex === index)
                            : (ticket.ticketIndex === 1 ? (paidIndex === 1 || paidIndex === 2) : paidIndex === index)

                        return (
                            <View key={ticket.plan} style={{ width: '100%', alignItems: 'center' }}>
                                <TouchableOpacity
                                    style={{ width: '100%', alignItems: 'center' }}
                                    onPress={() => {
                                        if (ticket.ticketIndex === 1) {
                                            toggleBusiness()
                                        }
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.ticketBox}>
                                        <View style={ticket.header}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                    <Text style={styles.ticketHeaderText}>{ticket.label}</Text>
                                                    {(ticket.ticketIndex === 1 ? (paidIndex === 1 || paidIndex === 2) : paidIndex === index) && (
                                                        <View style={{
                                                            backgroundColor: '#ffffff',
                                                            borderRadius: 10,
                                                            paddingHorizontal: 8,
                                                            paddingVertical: 2,
                                                        }}>
                                                            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#1A3A6B' }}>현재 플랜</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={styles.ticketHeaderText}>LTP</Text>
                                            </View>
                                        </View>
                                        <Image source={require('../../../../assets/ticket/barcode.png')} style={styles.barcode} />
                                        <View style={styles.ticketBody}>
                                            <View style={styles.ticketInfoCols}>
                                                <View style={styles.ticketInfoItem}>
                                                    <Text style={styles.ticketInfoLabel}>CLASS</Text>
                                                    <Text style={styles.ticketInfoValue}>{ticket.plan}</Text>
                                                </View>
                                                <View style={styles.ticketInfoDivider} />
                                                <View style={styles.ticketInfoItem}>
                                                    <Text style={styles.ticketInfoLabel}>PRICE</Text>
                                                    <Text style={styles.ticketInfoValue}>{ticket.price}</Text>
                                                </View>
                                                <View style={styles.ticketInfoDivider} />
                                                <View style={styles.ticketInfoItem}>
                                                    <Text style={styles.ticketInfoLabel}>SEAT</Text>
                                                    <Text style={styles.ticketInfoValue}>{ticket.seat}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <Image source={require('../../../../assets/ticket/logo_ticket.png')} style={styles.ticketLogo} />
                                        <View style={styles.tearLine} />
                                        {isStamped && (
                                            <Image
                                                source={require('../../../../assets/icons/paymentStamp.png')}
                                                style={styles.stampBadge}
                                            />
                                        )}
                                    </View>
                                    <View style={styles.tearTop} />
                                    <View style={styles.tearDown} />
                                </TouchableOpacity>

                                {ticket.ticketIndex === 1 && (
                                    <RNAnimated.View style={{
                                        width: '90%',
                                        height: cardHeight,
                                        overflow: 'hidden',
                                    }}>
                                        <View style={styles.ticketChoiceBox}>
                                            {[
                                                { label: '월간 구독', desc: '4,900원/월', idx: 1 },
                                                { label: '연간 구독', desc: '49,000원/년', idx: 2 },
                                            ].map((plan) => (
                                                <View key={plan.label} style={{ position: 'relative' }}>
                                                    {plan.idx === 2 && (
                                                        <View style={{
                                                            position: 'absolute',
                                                            top: 15,
                                                            right: 15,
                                                            zIndex: 10,
                                                            backgroundColor: '#1A3A6B',
                                                            borderRadius: 8,
                                                            paddingHorizontal: 8,
                                                            paddingVertical: 3,
                                                        }}>
                                                            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#ffffff' }}>약 17% 할인</Text>
                                                        </View>
                                                    )}
                                                    <TouchableOpacity
                                                        style={{
                                                            borderColor: selectedIndex === plan.idx ? '#1A3A6B' : '#d1d1d1',
                                                            borderWidth: selectedIndex === plan.idx ? 2 : 1,
                                                            borderRadius: 15,
                                                            padding: 16,
                                                            backgroundColor: '#FFFFFF',
                                                        }}
                                                        onPress={() => setSelectedIndex(plan.idx)}
                                                    >
                                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1A3A6B' }}>{plan.label}</Text>
                                                        <Text style={{ fontSize: 14, color: '#666666', marginTop: 4 }}>{plan.desc}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    </RNAnimated.View>
                                )}
                            </View>
                        )
                    })}
                </View>

                <TouchableOpacity
                    style={styles.textContainerMiddle}
                    onPress={() => handleScrollTo(subscribeBoxY - 22)}
                >
                    <View style={{
                        width: '90%',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 10,
                    }}>
                        <Text style={styles.subscribeSummary}>LighTrip을 더 자유롭게 ✈️</Text>
                        <View style={styles.subscribeBanner}>
                            {['광고 없음', 'AI 무제한', '테마 변경', '사진 여러 장', '팀 만들기'].map((badge) => (
                                <View key={badge} style={{
                                    backgroundColor: '#EEF2FA',
                                    borderRadius: 20,
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                }}>
                                    <Text style={{ fontSize: 13, color: '#1A3A6B', fontWeight: 'bold' }}>{badge}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <Ionicons name="caret-down" size={16} color="#000" style={{ marginTop: 10 }} />
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
                        <View key={item}>
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

            <Modal
                visible={!!webViewUrl}
                animationType="slide"
                onRequestClose={() => setWebViewUrl(null)}
            >
                <View style={{ flex: 1 }}>
                    <TouchableOpacity
                        onPress={() => setWebViewUrl(null)}
                        style={{ padding: 10, paddingTop: 50, backgroundColor: '#ffffff' }}
                    />
                    <WebView
                        source={{ uri: webViewUrl ?? '' }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        onError={(e) => console.log('WebView 에러:', e.nativeEvent)}
                        onHttpError={(e) => console.log('HTTP 에러:', e.nativeEvent.statusCode)}
                        injectedJavaScript={`
                            window.onerror = function(msg, src, line, col, err) {
                                window.ReactNativeWebView.postMessage('JS Error: ' + msg + ' at ' + src + ':' + line);
                            };
                            true;
                        `}
                        onMessage={(e) => console.log('WebView 메시지:', e.nativeEvent.data)}
                        onShouldStartLoadWithRequest={(req) => {
                            const url = req.url
                            if (url.startsWith(SUCCESS_URL)) {
                                const params = new URL(url).searchParams
                                handleConfirmPayment(
                                    params.get('paymentKey') ?? '',
                                    params.get('orderId') ?? '',
                                    Number(params.get('amount'))
                                )
                                return false
                            }
                            if (url.startsWith(FAIL_URL)) {
                                setWebViewUrl(null)
                                Alert.alert('결제 실패', '결제가 취소되었어요')
                                return false
                            }
                            if (!url.startsWith('http') && !url.startsWith('about:')) {
                                Linking.openURL(url)
                                return false
                            }
                            return true
                        }}
                    />
                </View>
            </Modal>

            <TouchableOpacity
                style={styles.payButton}
                onPress={handlePayment}
            >
                <Text style={styles.payButtonText}>결제하기</Text>
            </TouchableOpacity>
        </View>
    )
}