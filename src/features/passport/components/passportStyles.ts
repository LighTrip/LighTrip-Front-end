import { scaleFont, scaleW } from '@/src/utils/scale'
import { scale } from '@shopify/react-native-skia'
import { Dimensions, StyleSheet } from 'react-native'

const { width } = Dimensions.get('window')
export const COVER_WIDTH = (width - 20 * 2 - 1) / 2
export const COVER_HEIGHT = COVER_WIDTH * (4 / 3)
export const LIST_CARD_WIDTH = width - 40
export const LIST_STAMP_SIZE = Math.round(LIST_CARD_WIDTH * 0.23)
export const LIST_STAMP_ICON_SIZE = Math.round(LIST_CARD_WIDTH * 0.17)

export const passportStyles = StyleSheet.create({
    searchRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginHorizontal: 13,
        gap: scaleW(10),
        marginTop: 5,
        marginLeft: scaleW(24),
    },
    
    iconButton: {
        width: scaleW(35),
        height: scaleW(35),
        borderRadius: scaleW(10),
        backgroundColor: '#ffffff',
        borderWidth: scaleW(1),
        borderColor: '#1A3A6B',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 5,
    },

    iconButtonActive: {
        width: scaleW(35),
        height: scaleW(35),
        backgroundColor: '#1A3A6B',
    },
    
    searchInput: {
        width: Dimensions.get('window').width - 80,
        height: scaleW(35),
        backgroundColor: '#ffffff',
        borderRadius: scaleW(10),
        borderWidth: scaleW(1),
        borderColor: '#1A3A6B',
        paddingHorizontal: scaleW(10),
        fontSize: scaleFont(14),
        fontWeight: 'bold',
    },
    
    listContainer: {
        paddingHorizontal: 20,
    },
    
    listCard: {
        flexDirection: 'column',
        width: LIST_CARD_WIDTH,
        minHeight: LIST_STAMP_SIZE,
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        marginTop: 8,
        marginBottom: 10,
        shadowColor: '#4C4C4C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.17,
        shadowRadius: 5,
        elevation: 5,
    },

    listName: {
        color: '#111827',
        fontSize: 18,
        fontWeight: '700',
    },
    
    stamp: {
        color: '#000000',
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 12,
        padding: 15,
    },

    textArea: {
        position: 'absolute',
        flex: 1,
        paddingVertical: 15,
        left: LIST_STAMP_SIZE,
        gap: 5,
        flexDirection: 'column',
    },

    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 2,
        gap: 5,
        width: LIST_CARD_WIDTH - LIST_STAMP_SIZE - 55,
    },

    metaLocation: { 
        flexDirection: 'row', 
        paddingVertical: 2,
        top: -1,
        flex: 1,
    },

    metaDate: { 
        flexDirection: 'row',
    },

    meta: { 
        color: '#6B7280', 
        fontSize: 13,
        marginBottom: 10,
    },

    dropdown: {
        position: 'absolute',
        top: 36,
        left: -5,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#1A3A6B',
        zIndex: 999,
        minWidth: 130,
    },

    dropdownOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    dropdownText: { 
        fontSize: 14, 
        color: '#000' 
    },

    thumbnailArea: {
        width: '100%',
        height: 155,
        backgroundColor: '#E5E7EB',
        position: 'relative',
    },
    
    listThumbnail: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    
    listThumbnailPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#EAEAEA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    placeholderText: {
        fontSize: 13,
        color: '#999',
        fontWeight: '600',
    },
    
    dateBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    
    dateText: {
        color: '#333333',
        fontSize: 12,
        fontWeight: '600',
    },
    
    cardBody: {
        paddingHorizontal: 22,
        paddingTop: 18,
        paddingBottom: 14,
    },

    placeTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,    
    },

    locationIcon: {
        marginRight: 8,
    },

    contentText: {
        color: '#374151',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 10,
    },
    
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginBottom: 10,
    },
    
    countRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    
    countItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 18,
    },
    
    countText: {
        marginLeft: 8,
        color: '#333333',
        fontSize: 14,
        fontWeight: '600',
    },
    
    arrowIcon: {
        marginLeft: 'auto',
    },

    
})
