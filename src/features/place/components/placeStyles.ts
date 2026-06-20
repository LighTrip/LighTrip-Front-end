import { Dimensions, Platform, StatusBar, StyleSheet } from "react-native"

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

const sharedContainer = {
    flex: 1,
    backgroundColor: '#F8FAFD',
    justifyContent: 'flex-start' as const,
    alignItems: 'center' as const,
    paddingTop: StatusBar.currentHeight || 65,
}

const sharedClickContainer = {
    width: '92%' as const,
    alignSelf: 'center' as const,
    marginTop: -2,
    height: 45,
    borderRadius: 16,
    backgroundColor: '#1A3A6B',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
}

const sharedClickText = {
    color: '#FFFFFF',
    fontWeight: 'bold' as const,
}

export const editStyles = StyleSheet.create({
    container: sharedContainer,

    logContainer: {
        position: 'relative',
        height: screenHeight - 178,
        borderRadius: 16,
        backgroundColor: '#F8FAFD',
        justifyContent: 'flex-start',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: 10,
        marginTop: 20,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 8,
        top: 5,
    },

    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    headerTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#222',
    },

    photoBox: {
        position: 'relative',
        width: screenWidth * 0.83,
        height: screenHeight * 0.155,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        overflow: 'hidden'
    },

    photoIndicatorRow: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        marginTop: 147,
    },

    photoIndicatorDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#9c9c9c80',
    },

    photoIndicatorDotActive: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ffffff',
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
        fontSize: 12,
        color: '#222',
        fontWeight: '600',
        flex: 1,
    },

    divider: {
        height: 1,
        backgroundColor: '#4B4B4B',
    },

    dropdownRow: {
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: 16,
        gap: 8,
        marginTop: 16,
    },

    modalBackdrop: {
        flex: 1,
        backgroundColor: '#00000040',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalBox: {
        width: 200,
        maxHeight: 320,
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
        fontSize: 10,
        color: '#333',
    },

    modalItemTextSelected: {
        color: '#1A3A6B',
        fontWeight: '600',
    },

    contentSection: {
        width: '100%',
        minHeight: 130,
        maxHeight: 130,
        paddingHorizontal: 16,
        marginTop: 10,
        gap: 8,
    },

    contentLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        top: 5,
        bottom: 5,
    },

    contentLabel: {
        fontSize: 11,
        color: '#555',
        fontWeight: '500',
    },

    generatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    generatingText: {
        fontSize: 11,
        color: '#1A3A6B',
    },

    contentInput: {
        fontSize: 11,
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
        height: 70,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
        padding: 12,
        paddingRight: 20, 
        marginTop: 4,
        marginBottom: 10,
        gap: 12,
        bottom: 20,
    },

    albumArt: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#ddd',
    },

    musicInfo: { 
        gap: 4,
        flex: 1,
        maxWidth: '80%',
        overflow: 'hidden',
    },

    musicTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#222',
    },

    musicArtist: {
        fontSize: 10,
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
    },

    musicSearchInput: {
        flex: 1,
        fontSize: 11,
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
        width: 10,
        height: 10,
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
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
        paddingVertical: 12,
        gap: 12,
        marginRight: 10,
    },

    publicTitle: {
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'right',
        color: '#222',
    },

    publicSub: {
        fontSize: 8,
        color: '#888',
    },

    clickContainer: sharedClickContainer,

    clickText: sharedClickText,

    visibilityButton: {
        backgroundColor: '#1A3A6B',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },

    visibilityButtonText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '600',
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        backgroundColor: '#F8FAFD',
        paddingTop: StatusBar.currentHeight || 65,
        paddingBottom: 100,
    },
})


export const addStyles = StyleSheet.create({
    container: sharedContainer,

    photoContainer: {
        height: screenHeight * 0.53,
        borderRadius: 16,
        backgroundColor: '#F8FAFD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        overflow: 'hidden',
    },

    photoTextbox: {
        width: '91%',
        height: 50,
        borderRadius: 16,
    },

    photoText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 14,
        marginLeft: 30,
    },

    albumButton: {
        width: screenWidth * 0.82,
        height: screenHeight * 0.38,
        marginTop: 8,
        borderRadius: 16,
        marginBottom: 15,
        overflow: 'hidden',
    },

    albumButtonEmpty: {
        width: screenWidth * 0.82,
        height: screenHeight * 0.38,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        marginTop: 8,
        marginBottom: 15,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },

    photoAddButton: {
        width: 80,
        height: 315,
        backgroundColor: '#F0F0F0',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },

    photoScrollItem: {
        width: screenWidth * 0.82,
        height: screenHeight * 0.37,
        borderRadius: 16,
    },

    photoIndicatorRowAdd: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        left: 0,
        right: 0,
        bottom: 10,
    },

    cameraButton: {
        width: screenWidth * 0.57,
        height: screenHeight * 0.04,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1A3A6B',
        borderRadius: 20,
        marginBottom: 25,
    },

    infoContainer: {
        height: screenHeight * 0.2,
        borderRadius: 16,
        backgroundColor: '#F8FAFD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        overflow: 'hidden',
    },

    infoTextbox: {
        width: '91%',
        height: 30,
        marginBottom: 10,
    },

    infotitleText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 5,
        marginTop: 5,
    },

    infoTypeBox: {
        width: screenWidth * 0.82,
        height: screenHeight * 0.125,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginBottom: 5,
    },

    infoTypeText: {
        width: '100%',
        textAlign: 'center',
        fontSize: 12,
        color: '#A0A0A0',
        paddingHorizontal: 10,
        paddingTop: Platform.OS === 'ios' ? 5 : 10,
        lineHeight: 17,
    },

    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        backgroundColor: '#F8FAFD',
        paddingTop: StatusBar.currentHeight || 65,
        paddingBottom: 0,
    },
    clickContainer: sharedClickContainer,

    clickText: sharedClickText,
})