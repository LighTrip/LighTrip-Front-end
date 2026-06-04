import API_ENDPOINTS from '@/src/api/config'
import axiosInstance from '../axiosInstance'

export const createOrder = (productType: 'PREMIUM_1MONTH' | 'PREMIUM_1YEAR') =>
    axiosInstance.post(API_ENDPOINTS.PAYMENT.CREATE_ORDER, { productType })

export const confirmPayment = (paymentKey: string, orderId: string, amount: number) =>
    axiosInstance.post(API_ENDPOINTS.PAYMENT.CONFIRM, { paymentKey, orderId, amount })

export const getMyPremium = () =>
    axiosInstance.get(API_ENDPOINTS.PAYMENT.GET_MY_PREMIUM)