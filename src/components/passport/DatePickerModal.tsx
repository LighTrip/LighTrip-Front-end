// src/components/common/DatePickerModal.tsx
import React from 'react'
import { Modal, View, TouchableOpacity, Text } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'

type Props = {
    visible: boolean
    date: Date
    onChange: (date: Date) => void
    onClose: () => void
}

const DatePickerModal = ({ visible, date, onChange, onClose }: Props) => {
    return (
        <Modal transparent animationType="fade" visible={visible}>
            <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#00000040', justifyContent: 'flex-end' }}
                onPress={onClose}
                activeOpacity={1}
            >
                <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 }}>
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="spinner"
                        onChange={(event, selectedDate) => {
                            if (selectedDate) onChange(selectedDate)
                        }}
                    />
                    <TouchableOpacity
                        style={{ backgroundColor: '#1A3A6B', borderRadius: 12, padding: 14, alignItems: 'center', margin: 8 }}
                        onPress={onClose}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>확인</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    )
}

export default DatePickerModal