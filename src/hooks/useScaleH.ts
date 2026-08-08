import { Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const BASE_HEIGHT = 874

export const useScaleH = () => {
    const insets = useSafeAreaInsets()
    const { height } = Dimensions.get('window')
    const safeHeight = height - insets.top - insets.bottom
    return (size: number) => (safeHeight / BASE_HEIGHT) * size
}