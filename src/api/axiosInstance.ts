// src/api/axiosInstance.ts
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { BASE_URL } from './config'

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

axiosInstance.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('accessToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default axiosInstance