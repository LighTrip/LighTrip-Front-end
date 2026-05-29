import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import Ionicons from '@expo/vector-icons/build/Ionicons'
import colors from '@/src/constant/colors'
import { passportStyles } from './passportStyles'

type Props = {
    label?: string
    onSortChange?: (option: string) => void
    onSearchChange?: (text: string) => void
}

const SearchBar = ({ label, onSortChange, onSearchChange }: Props) => {
    const [searchSelected, setSearchSelected] = useState(false)
    const [sortVisible, setSortVisible] = useState(false)
    const [sortOption, setSortOption] = useState('최근 등록순')

    return (
        <View style={passportStyles.searchRow}>
            {searchSelected ? (
                <>
                    <TextInput
                        style={passportStyles.searchInput}
                        placeholder="기억에 남았던 장소를 입력하세요."
                        placeholderTextColor="#000000"
                        autoFocus
                        onChangeText={onSearchChange}
                    />
                    <TouchableOpacity
                        style={[passportStyles.iconButton, passportStyles.iconButtonActive]}
                        onPress={() => setSearchSelected(false)}
                    >
                        <Ionicons name="search" size={25} color={colors.text.primary} />
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Text style={{ color: '#4c4c4c', fontSize: 16, fontWeight: '600', marginTop: 10, flex: 1 }}>
                        {label ?? sortOption}
                    </Text>
                    <View>
                        <TouchableOpacity style={passportStyles.iconButton} onPress={() => setSortVisible(!sortVisible)}>
                            <Image source={require('../../../../assets/icons/reorder.png')} />
                        </TouchableOpacity>
                        {sortVisible && (
                            <View style={passportStyles.dropdown}>
                                {['최근 등록순', '이름순'].map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={passportStyles.dropdownOption}
                                        onPress={() => { 
                                            setSortOption(option)
                                            setSortVisible(false) 
                                            onSortChange?.(option)
                                        }}
                                    >
                                        <Text style={passportStyles.dropdownText}>{option}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                    <TouchableOpacity
                        style={passportStyles.iconButton}
                        onPress={() => setSearchSelected(true)}
                    >
                        <Ionicons name="search" size={25} color="#000000" />
                    </TouchableOpacity>
                </>
            )}
        </View>
    )
}

export default SearchBar