import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
} from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { REGIONS } from '@/src/constant/regions'

type Step = 'city' | 'district'

const RegionDropdown = ({
    label,
    value,
    onSelect,
}: {
    label: string
    value: string
    onSelect: (v: string) => void
}) => {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<Step>('city')
    const [selectedCity, setSelectedCity] = useState<string | null>(null)

    const cities = Object.keys(REGIONS)

    const handleOpen = () => {
        setStep('city')
        setSelectedCity(null)
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        setStep('city')
        setSelectedCity(null)
    }

    const handleCitySelect = (city: string) => {
        const districts = REGIONS[city]
        if (districts.length === 1) {
            onSelect(districts[0])
            handleClose()
        } else {
            setSelectedCity(city)
            setStep('district')
        }
    }

    const handleDistrictSelect = (district: string) => {
        onSelect(district)
        handleClose()
    }

    const listData = step === 'city' ? cities : REGIONS[selectedCity!] ?? []

    return (
        <View style={styles.dropdownWrapper}>
            <Text style={styles.dropdownLabel}>{label}</Text>
            <TouchableOpacity style={styles.dropdown} onPress={handleOpen}>
                <Text style={styles.dropdownText}>{value}</Text>
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#333" />
            </TouchableOpacity>

            <Modal
                visible={open}
                transparent
                animationType="fade"
                onRequestClose={handleClose}
            >
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    onPress={handleClose}
                    activeOpacity={1}
                >
                    <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                        <View style={styles.modalBox}>
                            {step === 'district' && (
                                <TouchableOpacity
                                    style={styles.backRow}
                                    onPress={() => {
                                        setStep('city')
                                        setSelectedCity(null)
                                    }}
                                >
                                    <Ionicons name="chevron-back" size={16} color="#1A3A6B" />
                                    <Text style={styles.backText}>{selectedCity}</Text>
                                </TouchableOpacity>
                            )}
                            <FlatList
                                data={listData}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => {
                                    const isSelected = item === value
                                    const hasChildren =
                                        step === 'city' && REGIONS[item].length > 1
                                    return (
                                        <TouchableOpacity
                                            style={[
                                                styles.modalItem,
                                                isSelected && styles.modalItemSelected,
                                            ]}
                                            onPress={() =>
                                                step === 'city'
                                                    ? handleCitySelect(item)
                                                    : handleDistrictSelect(item)
                                            }
                                        >
                                            <Text
                                                style={[
                                                    styles.modalItemText,
                                                    isSelected && styles.modalItemTextSelected,
                                                ]}
                                            >
                                                {item}
                                            </Text>
                                            {hasChildren ? (
                                                <Ionicons name="chevron-forward" size={14} color="#999" />
                                            ) : isSelected ? (
                                                <Ionicons name="checkmark" size={16} color="#1A3A6B" />
                                            ) : null}
                                        </TouchableOpacity>
                                    )
                                }}
                            />
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default RegionDropdown

const styles = StyleSheet.create({
    dropdownWrapper: {
        flex: 1,
        gap: 6,
    },

    dropdownLabel: {
        fontSize: 11,
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
        fontSize: 11,
        color: '#222',
    },

    modalBackdrop: {
        flex: 1,
        backgroundColor: '#00000040',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalBox: {
        width: 220,
        maxHeight: 360,
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 8,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        overflow: 'hidden',
    },

    backRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        gap: 4,
    },

    backText: {
        fontSize: 11,
        color: '#1A3A6B',
        fontWeight: '600',
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
