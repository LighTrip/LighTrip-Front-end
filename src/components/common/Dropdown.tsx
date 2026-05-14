import { 
    View, 
    Text, 
    TouchableOpacity, 
    Modal, 
    FlatList, 
    StyleSheet 
} from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'


const Dropdown = ({
    label,
    value,
    options,
    onSelect
}: {
    label: string
    value: string
    options: string[]
    onSelect: (v: string) => void
}) => {
    const [open, setOpen] = useState(false)

    return (
        <View style={styles.dropdownWrapper}>
            <Text style={styles.dropdownLabel}>{label}</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setOpen(true)}>
                <Text style={styles.dropdownText}>{value}</Text>
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#333" />
            </TouchableOpacity>

            <Modal
                visible={open}
                transparent
                animationType="fade"
                onRequestClose={() => setOpen(false)}
            >
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    onPress={() => setOpen(false)}
                    activeOpacity={1}
                >
                    <View style={styles.modalBox}>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.modalItem,
                                        item === value && styles.modalItemSelected
                                    ]}
                                    onPress={() => {
                                        onSelect(item)
                                        setOpen(false)
                                    }}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        item === value && styles.modalItemTextSelected
                                    ]}>
                                        {item}
                                    </Text>
                                    {item === value && (
                                        <Ionicons name="checkmark" size={16} color="#1A3A6B" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default Dropdown

const styles = StyleSheet.create({

    dropdownRow: {
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: 16,
        gap: 12,
        marginTop: 16,
    },

    dropdownWrapper: {
        flex: 1,
        gap: 6,
    },

    dropdownLabel: {
        fontSize: 13,
        color: '#555',
        fontWeight: '500',
    },

    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1.5,
        borderColor: '#1A3A6B',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },

    dropdownText: {
        fontSize: 14,
        color: '#222',
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
        fontSize: 14,
        color: '#333',
    },

    modalItemTextSelected: {
        color: '#1A3A6B',
        fontWeight: '600',
    },
})