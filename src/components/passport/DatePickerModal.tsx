// src/components/common/DatePickerModal.tsx
import React from 'react'
import { Modal, View, TouchableOpacity, Text, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'

type Props = {
    visible: boolean
    date: Date
    onChange: (date: Date) => void
    onClose: () => void
}

const DatePickerModal = ({ visible, date, onChange, onClose }: Props) => {
    if (!visible) return null

    // Android: 네이티브 Dialog 방식 — 선택/취소 시 자동 닫힘
    if (Platform.OS === 'android') {
        return (
            <DateTimePicker
                value={date}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                    if (event.type === 'set' && selectedDate) onChange(selectedDate)
                    onClose()
                }}
            />
        )
    }

    // iOS: 하단 시트 + 확인 버튼
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
                        maximumDate={new Date()}
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