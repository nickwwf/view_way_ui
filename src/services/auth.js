import Cookies from 'js-cookie'

const TokenKey = 'access_token'
const RefreshTokenKey = 'refresh_token'
const AuthMenuKey = 'auth_menu'
const UserNameKey = 'user_name'
const RecognitionCallbackUrlKey = 'recognition_callback_url'
const RecognitionCallbackEnabledKey = 'recognition_callback_enabled'

console.log('Auth module loaded')

export function getToken() {
  const token = Cookies.get(TokenKey)
  console.log('getToken:', token)
  return token
}

export function setToken(token) {
  console.log('setToken:', token)
  const result = Cookies.set(TokenKey, token, { expires: 1/96 }) // 15分钟
  console.log('setToken result:', result)
  return result
}

export function removeToken() {
  const result = Cookies.remove(TokenKey)
  console.log('removeToken result:', result)
  return result
}

export function getRefreshToken() {
  const token = Cookies.get(RefreshTokenKey)
  console.log('getRefreshToken:', token)
  return token
}

export function setRefreshToken(token) {
  console.log('setRefreshToken:', token)
  const result = Cookies.set(RefreshTokenKey, token, { expires: 7 }) // 7天
  console.log('setRefreshToken result:', result)
  return result
}

export function removeRefreshToken() {
  const result = Cookies.remove(RefreshTokenKey)
  console.log('removeRefreshToken result:', result)
  return result
}

export function getAuthMenu() {
  const raw = Cookies.get(AuthMenuKey)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    return raw.split(',').map(s => s.trim()).filter(Boolean)
  }
}

export function setAuthMenu(menu) {
  let arr = []
  if (Array.isArray(menu)) {
    arr = menu
  } else if (typeof menu === 'string') {
    const raw = menu.trim()
    if (raw.startsWith('[')) {
      try {
        const parsed = JSON.parse(raw)
        arr = Array.isArray(parsed) ? parsed : []
      } catch (e) {
        arr = raw.split(',').map(s => s.trim()).filter(Boolean)
      }
    } else {
      arr = raw.split(',').map(s => s.trim()).filter(Boolean)
    }
  }
  return Cookies.set(AuthMenuKey, JSON.stringify(arr), { expires: 7 })
}

export function removeAuthMenu() {
  return Cookies.remove(AuthMenuKey)
}

export function getUserName() {
  return Cookies.get(UserNameKey) || ''
}

export function setUserName(name) {
  const v = (name == null) ? '' : String(name).trim()
  if (!v) return Cookies.remove(UserNameKey)
  return Cookies.set(UserNameKey, v, { expires: 7 })
}

export function removeUserName() {
  return Cookies.remove(UserNameKey)
}

export function getRecognitionCallbackUrl() {
  return Cookies.get(RecognitionCallbackUrlKey) || ''
}

export function setRecognitionCallbackUrl(url) {
  const v = (url == null) ? '' : String(url).trim()
  if (!v) return Cookies.remove(RecognitionCallbackUrlKey)
  return Cookies.set(RecognitionCallbackUrlKey, v, { expires: 30 })
}

export function getRecognitionCallbackEnabled() {
  const v = Cookies.get(RecognitionCallbackEnabledKey)
  if (v == null) return false
  return v === '1' || v === 'true'
}

export function setRecognitionCallbackEnabled(enabled) {
  const v = enabled ? '1' : '0'
  return Cookies.set(RecognitionCallbackEnabledKey, v, { expires: 30 })
}
