import { 
    StatusBar, 
    StyleSheet, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    Image,
    Dimensions,
    View } from 'react-native'
import React, { useState } from 'react'
import { Shadow } from 'react-native-shadow-2'
import * as ImagePicker from 'expo-image-picker'


import EditPlaceScreen from './EditPlaceScreen'

const { width } = Dimensions.get('window')
export const CARD_WIDTH = width * 0.91

export const NoiseOverlay = () => (
    <Image
        source={require('../../../../assets/images/noise.png')}
        style={styles.noiseOverlay}
    />
)

const AddPlaceScreen = () => {

    const [showEdit, setShowEdit] = useState(false)
    const [photo, setPhoto] = useState<string | null>(null)

    const openAlbum = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!permission.granted) {
            alert('앨범 접근 권한이 필요해요')
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            aspect: [4, 3],
            quality: 1,
        })

        if (!result.canceled) {
            setPhoto(result.assets[0].uri)
        }
    }


    const openCamera = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync()
        if (!permission.granted) {
            alert('카메라 권한이 필요해요')
            return
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            aspect: [4, 3],
            quality: 1,
        })
        
        if (!result.canceled) {
            setPhoto(result.assets[0].uri)
        }
    }

    if (showEdit) {
        return <EditPlaceScreen onBack={() => setShowEdit(false)} photo={photo}/>
    }

    return (
        <View style={styles.container}>
            <Shadow
                distance={6}
                startColor={'#00000012'}
                offset={[0, 2]}
                style={{ width: CARD_WIDTH, marginBottom: 5, borderRadius: 16 }}
            >
                <View style={styles.photoContainer}>
                    <NoiseOverlay />
                    <View style={styles.photoTextbox}>
                        <Text style={styles.photoText}>장소의 사진을 등록해 주세요!</Text>
                    </View>
                    <TouchableOpacity style={styles.photoButton} onPress={openAlbum}>
                        {photo !== null ? (
                            <Image
                                source={{ uri: photo }}
                                style={{ width: '100%', height: '100%', borderRadius: 16 }}
                                resizeMode="cover"
                            />
                        ) : (
                            <Text style={{ color: '#aaa' }}>앨범에서 선택하기</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
                        <Text style={styles.clickText}>카메라로 촬영</Text>
                    </TouchableOpacity>
                </View>
            </Shadow>
            
            <Shadow
                distance={6}
                startColor={'#00000012'}
                offset={[0, 2]}
                style={{ width: CARD_WIDTH, borderRadius: 16 }}
            >
                <View style={styles.infoContainer}>
                    <NoiseOverlay />
                    <View style={styles.infoTextbox}>
                        <Text style={styles.infotitleText}>어떤 곳인지 간단히 설명해 주세요.</Text>
                    </View>
                    <View style={styles.infoTypeBox}>
                        <TextInput
                            style={styles.infoTypeText} 
                            placeholder='카페에 가서 커피를 마셨다!'
                            placeholderTextColor="#666666"
                        />
                    </View>
                </View>
            </Shadow>

            <TouchableOpacity
                style={styles.clickContainer}
                onPress={() => setShowEdit(true)}
            >
                <Text style={styles.clickText}>기록 생성하기 with AI</Text>
            </TouchableOpacity>
        </View>
    )
}

export default AddPlaceScreen

export const styles = StyleSheet.create({
    container: {
            flex: 1,
            backgroundColor: '#F8FAFD',
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingTop: StatusBar.currentHeight || 65,
            marginTop: 20, 
        },

    noiseOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.7,
    },    

    photoContainer: {
        height: 500,
        borderRadius: 16,
        backgroundColor: '#F8FAFD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        overflow: 'hidden',
    },

    photoTextbox: {
        width: '91%',
        height: 50,
        borderRadius: 16,
    },

    photoText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
        marginLeft: 5,
    },

    photoButton: {
        width: 340,
        height: 365,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        overflow: 'hidden',
    },
    
    cameraButton: {
        width: 240,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1A3A6B',
        borderRadius: 20,
    },

    infoContainer: {
        // width: '91%',
        height: 180,
        borderRadius: 16,
        backgroundColor: '#F8FAFD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        overflow: 'hidden',
    },

    infoTextbox: {
        width: '91%',
        height: 30,
        marginBottom: 10,
    },

    infotitleText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
    },

    infoTypeBox: {
        width: 340,
        height: 110,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },

    infoTypeText: {
        fontSize: 14,
        color: '#A0A0A0',
    },

    clickContainer: {
        width: '91%',
        height: 45,
        borderRadius: 16,
        backgroundColor: '#1A3A6B',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },

    clickText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    }

})