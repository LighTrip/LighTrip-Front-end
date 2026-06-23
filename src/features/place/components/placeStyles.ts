import { Platform, StyleSheet } from "react-native"
import { scaleW, scaleFont } from '@/src/utils/scale'

// height 관련 값은 useScaleH Hook으로 컴포넌트에서 인라인 적용

const sharedContainer = {
    flex: 1,
    backgroundColor: '#F8FAFD',
    justifyContent: 'flex-start' as const,
    alignItems: 'center' as const,
}

const sharedClickContainer = {
    width: '92%' as const,
    alignSelf: 'center' as const,
    marginTop: scaleW(0),
    marginBottom: scaleW(0),
    height: scaleW(45),
    borderRadius: scaleW(16),
    backgroundColor: '#1A3A6B',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
}

const sharedClickText = {
    color: '#FFFFFF',
    fontWeight: 'bold' as const,
    fontSize: scaleFont(14),
}

export const editStyles = StyleSheet.create({
    container: sharedContainer,

    logContainer: {
        position: 'relative',
        borderRadius: scaleW(16),
        backgroundColor: '#F8FAFD',
        justifyContent: 'flex-start',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: scaleW(10),
        marginTop: scaleW(20),
        // height: 인라인으로 scaleH(696) 적용
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: scaleW(16),
        paddingVertical: scaleW(8),
        top: scaleW(5),
    },

    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleW(4),
    },

    headerTitle: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: '#222',
    },

    photoBox: {
        position: 'relative',
        width: scaleW(334),
        borderRadius: scaleW(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: scaleW(10),
        overflow: 'hidden',
        // height: 인라인으로 scaleH(135) 적용
    },

    photoIndicatorRow: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: scaleW(6),
    },

    photoIndicatorDot: {
        width: scaleW(6),
        height: scaleW(6),
        borderRadius: scaleW(3),
        backgroundColor: '#9c9c9c80',
    },

    photoIndicatorDotActive: {
        width: scaleW(6),
        height: scaleW(6),
        borderRadius: scaleW(3),
        backgroundColor: '#ffffff',
    },

    infoSection: {
        width: '90%',
        paddingHorizontal: scaleW(16),
        marginTop: scaleW(8),
    },

    infoRowWrapper: { width: '100%' },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: scaleW(10),
        gap: scaleW(10),
    },

    infoText: {
        fontSize: scaleFont(12),
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
        paddingHorizontal: scaleW(16),
        gap: scaleW(8),
        marginTop: scaleW(16),
    },

    modalBackdrop: {
        flex: 1,
        backgroundColor: '#00000040',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalBox: {
        width: scaleW(200),
        backgroundColor: '#fff',
        borderRadius: scaleW(16),
        paddingVertical: scaleW(8),
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
        paddingHorizontal: scaleW(16),
        paddingVertical: scaleW(12),
    },

    modalItemSelected: {
        backgroundColor: '#F0F4FF',
    },

    modalItemText: {
        fontSize: scaleFont(10),
        color: '#333',
    },

    modalItemTextSelected: {
        color: '#1A3A6B',
        fontWeight: '600',
    },

    contentSection: {
        width: '100%',
        paddingHorizontal: scaleW(16),
        marginTop: scaleW(10),
        gap: scaleW(8),
    },

    contentLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    contentLabel: {
        fontSize: scaleFont(12),
        color: '#555',
        fontWeight: '500',
    },

    generatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleW(6),
    },

    generatingText: {
        fontSize: scaleFont(13),
        color: '#1A3A6B',
    },

    contentInput: {
        fontSize: scaleFont(13),
        color: '#222',
        borderBottomWidth: 1,
        borderBottomColor: '#C0C0C0',
        paddingVertical: scaleW(4),
        // lineHeight, minHeight: 인라인으로 scaleH 적용
    },

    musicCard: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '91%',
        borderRadius: scaleW(16),
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
        padding: scaleW(12),
        paddingRight: scaleW(20),
        marginTop: scaleW(4),
        marginBottom: scaleW(10),
        gap: scaleW(12),
        // height: 인라인으로 scaleH(70) 적용
    },

    albumArt: {
        width: scaleW(50),
        height: scaleW(50),
        borderRadius: scaleW(25),
        backgroundColor: '#ddd',
    },

    musicInfo: {
        gap: scaleW(4),
        flex: 1,
        maxWidth: '80%',
        overflow: 'hidden',
    },

    musicTitle: {
        fontSize: scaleFont(14),
        fontWeight: 'bold',
        color: '#222',
    },

    musicArtist: {
        fontSize: scaleFont(12),
        color: '#888',
    },

    musicModalBox: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '70%',
        backgroundColor: '#fff',
        borderTopLeftRadius: scaleW(20),
        borderTopRightRadius: scaleW(20),
        padding: scaleW(16),
    },

    musicSearchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: scaleW(12),
        paddingHorizontal: scaleW(12),
        paddingVertical: scaleW(10),
        gap: scaleW(8),
    },

    musicSearchInput: {
        flex: 1,
        fontSize: scaleFont(11),
        color: '#222',
    },

    musicResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: scaleW(10),
        gap: scaleW(12),
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    musicResultArt: {
        width: scaleW(10),
        height: scaleW(10),
        borderRadius: scaleW(8),
        backgroundColor: '#ddd',
    },

    musicResultInfo: {
        flex: 1,
        gap: scaleW(4),
    },

    musicResultTitle: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: '#222',
    },

    musicResultArtist: {
        fontSize: scaleFont(12),
        color: '#888',
    },

    publicRow: {
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
        paddingVertical: scaleW(12),
        gap: scaleW(12),
        marginRight: scaleW(10),
    },

    publicTitle: {
        fontSize: scaleFont(12),
        fontWeight: '600',
        textAlign: 'right',
        color: '#222',
    },

    publicSub: {
        fontSize: scaleFont(10),
        color: '#888',
    },

    clickContainer: sharedClickContainer,
    clickText: sharedClickText,

    visibilityButton: {
        backgroundColor: '#1A3A6B',
        borderRadius: scaleW(10),
        paddingHorizontal: scaleW(16),
        paddingVertical: scaleW(8),
    },

    visibilityButtonText: {
        color: '#ffffff',
        fontSize: scaleFont(12),
        fontWeight: '600',
    },

    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        backgroundColor: '#F8FAFD',
        paddingBottom: scaleW(30),
    },
})


export const addStyles = StyleSheet.create({
    container: sharedContainer,

    photoContainer: {
        borderRadius: scaleW(16),
        backgroundColor: '#F8FAFD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: scaleW(20),
        overflow: 'hidden',
    },

    photoTextbox: {
        width: '91%',
        height: scaleW(50),
        borderRadius: scaleW(16),
    },

    photoText: {
        fontSize: scaleFont(15),
        fontWeight: 'bold',
        marginTop: scaleW(14),
        marginLeft: scaleW(30),
    },

    albumButton: {
        width: scaleW(330),
        marginTop: scaleW(8),
        borderRadius: scaleW(16),
        marginBottom: scaleW(15),
        overflow: 'hidden',
    },

    albumButtonEmpty: {
        width: scaleW(330),
        borderRadius: scaleW(16),
        backgroundColor: '#FFFFFF',
        marginTop: scaleW(8),
        marginBottom: scaleW(15),
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },

    photoAddButton: {
        width: scaleW(80),
        backgroundColor: '#F0F0F0',
        borderRadius: scaleW(16),
        justifyContent: 'center',
        alignItems: 'center',
    },

    photoScrollItem: {
        width: scaleW(330),
        borderRadius: scaleW(16),
    },

    photoIndicatorRowAdd: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: scaleW(6),
        left: 0,
        right: 0,
        bottom: scaleW(10),
    },

    cameraButton: {
        width: scaleW(229),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1A3A6B',
        borderRadius: scaleW(20),
        marginBottom: scaleW(25),
    },

    infoContainer: {
        borderRadius: scaleW(16),
        backgroundColor: '#F8FAFD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: scaleW(20),
        overflow: 'hidden',
    },

    infoTextbox: {
        width: '91%',
        height: scaleW(30),
        marginBottom: scaleW(10),
    },

    infotitleText: {
        fontSize: scaleFont(14),
        fontWeight: 'bold',
        marginLeft: scaleW(5),
        marginTop: scaleW(5),
    },

    infoTypeBox: {
        width: scaleW(330),
        borderRadius: scaleW(16),
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        paddingHorizontal: scaleW(10),
        paddingVertical: scaleW(5),
        marginBottom: scaleW(5),
    },

    infoTypeText: {
        width: '100%',
        textAlign: 'center',
        fontSize: scaleFont(12),
        color: '#A0A0A0',
        paddingHorizontal: scaleW(10),
        paddingTop: Platform.OS === 'ios' ? scaleW(5) : scaleW(10),
    },

    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        backgroundColor: '#F8FAFD',
        paddingBottom: scaleW(30),
    },

    clickContainer: sharedClickContainer,
    clickText: sharedClickText,
})