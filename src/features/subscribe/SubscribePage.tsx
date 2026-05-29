import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    Image,
} from "react-native";
import { router, useRouter } from 'expo-router'
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Shadow } from 'react-native-shadow-2'

export default function SubscribePage() {
    const router = useRouter()

    const [selectedIndex, setSelectedIndex] = useState<number | null>(0)


    return(
        <View style={styles.container}>
            <View style={styles.topBox}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.topText}>나의 구독</Text>

                <View style={styles.topLine}>
                    <Text style={styles.departure}>LTP</Text>
                    <Ionicons name="airplane-sharp" size={30} color="#FFFFFF" style={ { marginLeft: 10 } } />
                    <Text style={styles.destination}>ME</Text>
                </View>

                <View style={styles.dotLine}>
                    {Array.from({ length: 50 }).map((_, i) => (
                        <View key={i} style={styles.dot} />
                    ))}
                </View>

                <View style={styles.classLine}>
                    <Text style={styles.classText}>클래스</Text>
                    <View style={styles.classBanner}>
                        <Text style={styles.classBannerText}>ECONOMY CLASS</Text>
                    </View>
                </View>
            </View>


            <ScrollView style={{ width: '100%', marginBottom: -20 }} contentContainerStyle={{ alignItems: 'center', paddingBottom: 5 }}>
                {/* 구독 기능 */}
                <View style={styles.textContainer}>
                    <Text style={styles.textContent}>구독</Text>
                </View>

                <View style={styles.ticketContainer}>
                    {[
                        { header: styles.economyticketHeader, label: 'ECONOMY CLASS                                                   LTP', text: '기본 플랜' },
                        { header: styles.businessticketHeader, label: 'BUSINESS CLASS                                                   LTP', text: '월간 구독: 4,900원', },
                        { header: styles.businessticketHeader, label: 'BUSINESS CLASS                                                   LTP', text: '연간 구독: 49,000' },
                    ].map((ticket, index) => (
                        <TouchableOpacity
                            key={index}
                            style={{ width: '100%', alignItems: 'center' }}
                            onPress={() => setSelectedIndex(index === selectedIndex ? null : index)}
                            activeOpacity={0.8}
                        >
                            
                            <View style={[styles.ticketBox,]}>
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

                <View style={styles.textContainer}>
                    <Text style={styles.textContent}>구독 기능 상세보기</Text>
                    <Ionicons name="caret-down" size={16} color="#000" style={{ marginTop: 5 }} />
                </View>

                <View style={styles.subscribeBox}>
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

            </ScrollView>
            
            <TouchableOpacity style={styles.payButton}>
                <Text style={styles.payButtonText}>결제하기</Text>
            </TouchableOpacity>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFD',
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 50,
        marginBottom: 90,
    },

    topBox: {
        backgroundColor: "#1A3A6B",
        width: "100%",
        height: 240,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginTop: -60,
    },

    topLine: {
        flexDirection: "row",
        width: '80%',
        height: 30,
        top: 100,
        left: 40,
        alignItems: "center",
        justifyContent: "center",
        gap: 60,
    },

    departure: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "semibold",
        fontFamily: 'Freesentation-200',
    },

    destination: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "semibold",
        marginLeft: 10,
        fontFamily: 'Freesentation-200',
    },

    dotLine: {
        flexDirection: 'row',
        width: '100%',
        top: 125,
        gap: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },

    dot: {
        width: 3,
        height: 1,
        borderRadius: 2,
        backgroundColor: '#FFFFFF80',
    },

    classLine: {
        position: 'absolute',
        top: 197,
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15, 
    },

    classText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },

    classBanner: {
        width: 250,
        height: 25,
        backgroundColor: '#FFD9A7',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },

    classBannerText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        fontFamily: 'Freesentation-200',
    },

    topRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        gap: 10,
    },
    
    topText: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "bold",
        top: 70,
        left: 38,
    },

    closeButton: {
        position: 'absolute',
        top: 71,
        left: 10,
        zIndex: 10,
    },

    closeText: {
        fontSize: 22,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },

    textContainer: {
        width: '90%',
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },

    textContent: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
    },

    ticketContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        marginBottom: 15,
    },

    ticketBox: {
        width: '90%',
        height: 115,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    tearLine: {
        position: 'absolute',
        right: 80,
        top: 0,
        bottom: 0,
        width: 1,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#CCCCCC',
    },

    tearTop: {
        position: 'absolute',
        right: 71,
        top: -12,
        width: 20,
        height: 20,
        borderRadius: 12,
        backgroundColor: '#F8FAFD',
        zIndex: 10,
    },

    tearDown: {
        position: 'absolute',
        right: 71,
        bottom: -12,
        width: 20,
        height: 20,
        borderRadius: 12,
        backgroundColor: '#F8FAFD',
        zIndex: 10,
    },

    economyticketHeader: {
        width: '100%',
        backgroundColor: '#FFD9A7',
        paddingHorizontal: 12,
        paddingVertical: 8,
        top: -30,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },

    businessticketHeader: {
        width: '100%',
        backgroundColor: '#8FB88A',
        paddingHorizontal: 12,
        paddingVertical: 8,
        top: -30,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },

    ticketHeaderText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'Freesentation-400',
    },

    barcode: {
        position: 'absolute',
        width: 17,
        height: 60,
        left: 10,  
        top: 44,      
    },

    ticketText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
        fontFamily: 'Freesentation',
    },

    checkBadge: {
        position: 'absolute',
        top: 65,
        right: -10,
        width: 60,
        height: 60,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    subscribeBox: {
        width: '90%',
        height: 500,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        borderRadius: 15,
    },

    notch: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F8FAFD',
        zIndex: 10,
        top: -10,
    },

    subscribeItem: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },

    subscribeItemText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
    },

    itemDivider: {
        width: '100%',
        height: 1,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#CCCCCC',
    },

    payButton: {
        marginTop: 30,
        width: '90%',
        height: 50,
        backgroundColor: '#1A3A6B',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    payButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },

});