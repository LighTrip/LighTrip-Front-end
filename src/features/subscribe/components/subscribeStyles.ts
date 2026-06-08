import { Platform, StyleSheet } from 'react-native'

export const subscribeStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFD',
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 50,
        paddingBottom: 86,
    },

    topBox: {
        backgroundColor: "#1A3A6B",
        width: "100%",
        height: 220,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginTop: -60,
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 7,
    },

    topLine: {
        flexDirection: "row",
        width: '80%',
        height: 30,
        top: 84,
        left: 40,
        alignItems: "center",
        justifyContent: "center",
        gap: 60,
    },

    departure: {
        color: "#FFFFFF",
        fontSize: 26,
        fontFamily: 'Freesentation-200',
    },

    destination: {
        color: "#FFFFFF",
        fontSize: 26,
        marginLeft: 10,
        fontFamily: 'Freesentation-200',
    },

    dotLine: {
        flexDirection: 'row',
        width: '100%',
        top: 105,
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
        top: 177,
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
        width: '80%',
        height: 28,
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
        letterSpacing: Platform.OS === 'ios' ? 1.5 : 0.5,
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

    textContainerTop: {
        width: '90%',
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },

    textContainerMiddle: {
        width: '90%',
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
    },

    textContentTop: {
        fontSize: 14,
        fontWeight: 'semibold',
        color: '#000000',
    },

    textContentBottom: {
        marginTop: 10,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
    },

    ticketContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15,
        marginBottom: 15,
    },

    ticketBox: {
        width: '90%',
        height: 125,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderColor: '#d1d1d1',
        borderWidth: 1,
    },
    
    ticketChoiceBox: {  
        position: 'absolute',
        height: '50%',
        width: '100%',
        top: 10,
        left: 0,
        gap: 10,
        borderRadius: 15,
        padding: 10,
    },

    tearLine: {
        position: 'absolute',
        right: 89,
        top: 0,
        bottom: 0,
        width: 1,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#CCCCCC',
    },

    tearTop: {
        position: 'absolute',
        right: 100,
        top: -12,
        width: 20,
        height: 20,
        borderRadius: 12,
        backgroundColor: '#F8FAFD',
        zIndex: 10,
    },

    tearDown: {
        position: 'absolute',
        right: 100,
        bottom: -12,
        width: 20,
        height: 20,
        borderRadius: 12,
        backgroundColor: '#F8FAFD',
        zIndex: 10,
    },

    economyticketHeader: {
        position: 'absolute',
        width: '100%',
        backgroundColor: '#FFD9A7',
        paddingHorizontal: 12,
        paddingVertical: 8,
        top: 0,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },

    businessticketHeader: {
        position: 'absolute',
        width: '100%',
        backgroundColor: '#8FB88A',
        paddingHorizontal: 12,
        paddingVertical: 8,
        top: 0,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },

    ticketHeaderText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000000',
        fontFamily: 'Freesentation-400',
    },

    barcode: {
        position: 'absolute',
        width: 17,
        height: 68,
        left: 10,
        top: 44,
    },

    ticketLogo: {
        position: 'absolute',
        width: 70,
        height: 70,
        right: -5,
        top: 55,
        opacity: 0.3,
    },

    ticketText: {
        position: 'absolute',
        top: 55,
        left: 125,
        fontSize: 40,
        fontWeight: 'regular',
        color: '#000000',
        fontFamily: 'Freesentation-700',
    },

    ticketPriceText: {
        position: 'absolute',
        left: 285,
        top: 80,
        fontSize: 16,
        color: '#000000',
        fontFamily: 'Freesentation-400',
    },

    ticketBenefitText: {
        position: 'absolute',
        left: -140,
        top: 22,
        fontSize: 12,
        color: '#000000',
        fontFamily: 'Freesentation-400',
    },

    stampBadge: {
        position: 'absolute',
        top: 42,
        right: 5,
        width: 75,
        height: 75,
        borderRadius: 12,
    },

    subscribeBox: {
        width: '90%',
        height: 600,
        top: 10,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        borderRadius: 15,
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
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
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },

    subscribeSummary: { 
        fontSize: 15, 
        fontWeight: 'bold', 
        color: '#1A3A6B',
        marginBottom: 15,
    },

    subscribeBanner: { 
        flexDirection: 'row', 
        gap: 10, 
        flexWrap: 'wrap', 
        justifyContent: 'center',
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

    scrollTopContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        height: 40,
        gap: 4,
        marginTop: 30,
    },

    scrollTopText: {
        fontSize: 12,
        color: '#000000',
    },

    qnaContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        marginTop: 15,
    },

    endText: {
        fontSize: 12,
        textAlign: 'center',
    },

    qnaText: {
        fontSize: 12,
        color: '#2200ff',
        textDecorationLine: 'underline',
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
})