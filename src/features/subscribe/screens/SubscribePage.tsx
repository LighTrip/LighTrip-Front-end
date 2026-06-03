import {
    Text,
    TouchableOpacity,
    View,
    Image,
    Platform,
    Modal,
    Alert,
    Linking,
} from "react-native";
import Animated, { useAnimatedRef, scrollTo, runOnUI } from 'react-native-reanimated'
import { WebView } from 'react-native-webview'
import { useRouter } from 'expo-router'
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { createOrder, confirmPayment, getMyPremium } from '@/src/api/payment/payment.api'

import { subscribeStyles as styles } from '../components/subscribeStyles';

export default function SubscribePage() {
    const router = useRouter()

    const [webViewUrl, setWebViewUrl] = useState<string | null>(null)
    const [isPremium, setIsPremium] = useState(false)
    const TOSS_CLIENT_KEY = process.env.EXPO_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY ?? ''
    const SUCCESS_URL = 'https://lightrip.app/payment/success'
    const FAIL_URL = 'https://lightrip.app/payment/fail'

    const [paidIndex, setPaidIndex] = useState<number | null>(null)
    const plans = ['기본 플랜', '월간 구독', '연간 구독']
    const planLabels = ['ECONOMY CLASS', 'BUSINESS CLASS', 'BUSINESS CLASS']
    const bannerColors = ['#FFD9A7', '#8FB88A', '#8FB88A']

    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const [qnaVisible, setQnaVisible] = useState(false)
    const [subscribeBoxY, setSubscribeBoxY] = useState(0)

    const animatedRef = useAnimatedRef<Animated.ScrollView>()

    useEffect(() => {
        const fetchPremium = async () => {
            try {
                const res = await getMyPremium()
                if (res.data.data.premium) {
                    setIsPremium(true)
                    setPaidIndex(1)  
                }
            } catch (err) {}
        }
        fetchPremium()
    }, [])

    const handlePayment = async () => {
        console.log('selectedIndex:', selectedIndex)
        if (selectedIndex === 0) {
            Alert.alert('안내', '기본 플랜은 무료예요!')
            return
        }
        const productType = selectedIndex === 1 ? 'PREMIUM_1MONTH' : 'PREMIUM_1YEAR'
        try {
            const res = await createOrder(productType)
            console.log('주문 생성 응답:', JSON.stringify(res.data))
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
        } catch (err) {
            Alert.alert('오류', '주문 생성에 실패했어요.')
        }
    }

    const handleConfirmPayment = async (paymentKey: string, orderId: string, amount: number) => {
        try {
            await confirmPayment(paymentKey, orderId, amount)
            const res = await getMyPremium()
            setIsPremium(res.data.data.premium)
            setPaidIndex(selectedIndex)  // 추가
            setWebViewUrl(null)
            Alert.alert('결제 완료', '구독이 시작되었어요! 🎉')
        } catch (err) {
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
                    <Text style={styles.classText}>클래스</Text>
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
                                <Image source={require('../../../../assets/ticket/barcode.png')} style={styles.barcode} />
                                <Text style={styles.ticketText}>{ticket.text}</Text>
                                <View style={styles.tearTop} />
                                <View style={styles.tearDown} />
                                <View style={styles.tearLine} />
                                {(selectedIndex !== null ? selectedIndex === index : paidIndex === index) && (
                                    <Image
                                        source={require('../../../../assets/icons/paymentStamp.png')}
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

            <Modal
                visible={!!webViewUrl}
                animationType="slide"
                onRequestClose={() => setWebViewUrl(null)}
            >
                <View style={{ flex: 1 }}>
                    <TouchableOpacity
                        onPress={() => setWebViewUrl(null)}
                        style={{ padding: 10, paddingTop: 50, backgroundColor: '#ffffff' }}
                    >
                    </TouchableOpacity>
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