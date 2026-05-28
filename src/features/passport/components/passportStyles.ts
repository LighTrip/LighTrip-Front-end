import { StyleSheet, Dimensions } from 'react-native'

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
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    
    listCard: {
        width: Dimensions.get('window').width - 32,
        height: 80,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginTop: 10,
        marginBottom: 10,
        alignItems: 'center',
        shadowColor: '#1A3A6B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 4,
    },

    listName: {
        color: '#000000',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
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
        gap: 24 
    },

    meta: { 
        color: '#000000', 
        fontSize: 14, 
        fontWeight: '500' 
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
})
