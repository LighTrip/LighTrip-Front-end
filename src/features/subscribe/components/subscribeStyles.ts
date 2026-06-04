import { StyleSheet } from 'react-native'

export const subscribeStyles = StyleSheet.create({
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
        height: 220,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginTop: -60,
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
        gap: 22,
        marginBottom: 15,
    },

    ticketBox: {
        width: '90%',
        height: 115,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
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
        color: '#000000',
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
        width: 70,
        height: 70,
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