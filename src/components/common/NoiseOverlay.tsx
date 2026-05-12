import { Image, StyleSheet } from 'react-native'

const NoiseOverlay = () => (
    <>
        <Image
            source={require('../../../assets/images/noise.png')}
            style={[styles.noiseOverlay, { top: 0 }]}
        />
        <Image
            source={require('../../../assets/images/noise.png')}
            style={[styles.noiseOverlay, { top: 400 }]}
        />
    </>
)

export default NoiseOverlay

const styles = StyleSheet.create({
    noiseOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 1,
    }, 
})