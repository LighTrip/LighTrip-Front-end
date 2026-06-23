import { Dimensions } from 'react-native'

const { width, height } = Dimensions.get('window')

const BASE_WIDTH = 402   // Figma 기준 프레임 너비
const BASE_HEIGHT = 874  // Figma 기준 프레임 높이

export const scaleW = (size: number) => (width / BASE_WIDTH) * size
export const scaleH = (size: number) => (height / BASE_HEIGHT) * size
export const scaleFont = (size: number) => Math.round(scaleW(size))