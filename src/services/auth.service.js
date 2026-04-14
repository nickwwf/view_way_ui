import api from './api'
import { setToken, setRefreshToken, removeToken, removeRefreshToken, getToken, setAuthMenu, removeAuthMenu, setUserName, removeUserName } from './auth'

export function login(data) {
  return new Promise((resolve, reject) => {
    console.log('登录请求参数:', data)
    api.post('/v1/user/login', data)
      .then(response => {
        console.log('登录接口返回数据:', response)
        console.log('响应数据类型:', typeof response)
        console.log('响应数据是否为对象:', response instanceof Object)
        
        // 检查响应数据结构，处理不同格式的返回
        let accessToken, refreshToken, authMenu, userName
        if (response.access_token && response.refresh_token) {
          // 直接返回token的情况
          accessToken = response.access_token
          refreshToken = response.refresh_token
          authMenu = response.auth_menu
          userName = response.user_name || response.username || response.user?.user_name || response.user?.username
        } else if (response.data && response.data.access_token && response.data.refresh_token) {
          // 嵌套在data中的情况
          accessToken = response.data.access_token
          refreshToken = response.data.refresh_token
          authMenu = response.data.auth_menu
          userName = response.data.user_name || response.data.username || response.data.user?.user_name || response.data.user?.username
        } else {
          // 其他情况
          console.log('登录接口返回的数据中没有token:', response)
          resolve(response)
          return
        }
        
        console.log('获取到的access_token:', accessToken)
        console.log('获取到的refresh_token:', refreshToken)
        
        console.log('设置token:', accessToken)
        const setTokenResult = setToken(accessToken)
        console.log('setToken执行结果:', setTokenResult)
        const setRefreshTokenResult = setRefreshToken(refreshToken)
        console.log('setRefreshToken执行结果:', setRefreshTokenResult)
        setAuthMenu(authMenu)
        setUserName(userName || data?.app_key)
        
        setTimeout(() => {
          const tokenAfterSet = getToken()
          console.log('设置后的token:', tokenAfterSet)
          resolve(response)
        }, 100)
      })
      .catch(error => {
        console.error('登录失败:', error)
        console.error('错误响应:', error.response)
        reject(error)
      })
  })
}

export function refreshToken(data) {
  return new Promise((resolve, reject) => {
    api.post('/v1/user/refresh', data)
      .then(response => {
        console.log('刷新token接口返回数据:', response)
        console.log('响应数据类型:', typeof response)
        
        // 检查响应数据结构，处理不同格式的返回
        let accessToken
        if (response.access_token) {
          // 直接返回token的情况
          accessToken = response.access_token
        } else if (response.data && response.data.access_token) {
          // 嵌套在data中的情况
          accessToken = response.data.access_token
        }
        
        if (accessToken) {
          console.log('设置新token:', accessToken)
          setToken(accessToken)
        }
        resolve(response)
      })
      .catch(error => {
        console.error('刷新token失败:', error)
        console.error('错误响应:', error.response)
        reject(error)
      })
  })
}

export function logout() {
  removeToken()
  removeRefreshToken()
  removeAuthMenu()
  removeUserName()
}
