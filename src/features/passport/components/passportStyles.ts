import { Dimensions, StyleSheet } from 'react-native'

export const COVER_WIDTH = (Dimensions.get('window').width - 20 * 2 - 1) / 2
export const COVER_HEIGHT = COVER_WIDTH * (4 / 3)

export const passportStyles = StyleSheet.create({
    searchRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginHorizontal: 13,
        gap: 5,
        marginTop: 5,
        marginLeft: 20,
    },
    
    iconButton: {
        width: 39,
        height: 39,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#1A3A6B',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 5,
    },

    iconButtonActive: {
        width: 39,
        height: 39,
        backgroundColor: '#1A3A6B',
    },
    
    searchInput: {
        width: Dimensions.get('window').width - 80,
        height: 39,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#1A3A6B',
        paddingVertical: 8,
        paddingHorizontal: 16,
        fontSize: 14,
        fontWeight: 'bold',
    },
    
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    
    listCard: {
        width: Dimensions.get('window').width - 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        marginTop: 8,
        marginBottom: 15,
        overflow: "hidden",
        shadowColor: '#4C4C4C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.16,
        shadowRadius: 10,
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

    textArea: { flex: 1 },

    metaRow: { 
        flexDirection: 'row', 
        gap: 24,
        paddingVertical: 2,
    },

    meta: { 
        color: '#6B7280', 
        fontSize: 13,
        marginBottom: 10,
    },

    dropdown: {
        position: 'absolute',
        top: 44,
        right: 0,
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
