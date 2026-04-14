import axios from 'axios'
import { getToken, setToken, removeToken, getRefreshToken, removeRefreshToken } from './auth'

const service = axios.create({
  baseURL: 'http://192.168.10.131:6001',
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    console.log('API响应:', response)
    console.log('响应状态码:', response.status)
    console.log('响应数据:', response.data)
    const res = response.data
    return res
  },
  async error => {
    console.error('API错误:', error)
    console.error('错误状态码:', error.response?.status)
    console.error('错误响应数据:', error.response?.data)
    const originalRequest = error.config
    const reqUrl = String(originalRequest?.url || '')
    const isAuthRequest =
      reqUrl.includes('/v1/user/login') ||
      reqUrl.includes('/v1/user/refresh') ||
      reqUrl.includes('/v1/user/register')
    if (error.response && error.response.status === 401 && !isAuthRequest && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = getRefreshToken()
        if (!refreshToken) {
          removeToken()
          removeRefreshToken()
          location.href = '/login'
          return Promise.reject(error)
        }
        const response = await service.post('/v1/user/refresh', {
          refresh_token: refreshToken
        })
        const newAccessToken = response?.data?.access_token
        if (newAccessToken) {
          setToken(newAccessToken)
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
          return service(originalRequest)
        } else {
          removeToken()
          removeRefreshToken()
          location.href = '/login'
          return Promise.reject(error)
        }
      } catch (refreshError) {
        removeToken()
        removeRefreshToken()
        location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    const serverMsg =
      error?.response?.data?.msg ||
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      ''
    if (serverMsg) {
      const normalized = String(serverMsg).trim().toLowerCase()
      if (normalized === 'insufficient balance') {
        error.message = '余额不足'
      } else {
        error.message = serverMsg
      }
    }
    return Promise.reject(error)
  }
)

export default service
