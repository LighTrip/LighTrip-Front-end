import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Ionicons from '@expo/vector-icons/build/Ionicons'
import Svg, { Path } from 'react-native-svg'
import colors from '@/src/constant/colors'
import { passportStyles } from './passportStyles'
import { scaleW } from '@/src/utils/scale'

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
                        placeholderTextColor="#aaa"
                        autoFocus
                        onChangeText={onSearchChange}
                    />
                    <TouchableOpacity
                        style={[passportStyles.iconButton, passportStyles.iconButtonActive]}
                        onPress={() => setSearchSelected(false)}
                    >
                        <Ionicons name="search" size={scaleW(23)} color={colors.text.primary} />
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingVertical: 6 }}
                            onPress={() => setSortVisible(!sortVisible)}
                        >
                            <Text style={{ color: '#4c4c4c', fontSize: 16, fontWeight: '600' }}>{label ?? sortOption}</Text>
                            {!label && (
                                <Svg width={16} height={8} viewBox="0 0 16 8" fill="none">
                                    <Path d="M0.75 0.749999L6.96905 6.08061C7.41844 6.4658 8.08156 6.4658 8.53095 6.08061L14.75 0.75" stroke="#2B3F6C" strokeWidth="1.5" strokeLinecap="round" />
                                </Svg>
                            )}
                        </TouchableOpacity>
                        {sortVisible && (
                            <View style={passportStyles.dropdown}>
                                {['최근 등록순', '이름순'].map((option, idx, arr) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[passportStyles.dropdownOption, idx === arr.length - 1 && { borderBottomWidth: 0 }]}
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