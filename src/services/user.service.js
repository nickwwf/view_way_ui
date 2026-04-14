import service from './api'

const userService = {
  // 创建用户
  createUser(data) {
    return service.post('/v1/user/create', data)
  },
  
  // 获取用户列表
  getUsers(params) {
    return service.get('/v1/user/list', { params })
  },
  
  // 更新用户
  updateUser(id, data) {
    return service.post('/v1/user/update', { id, ...data })
  },
  
  // 删除用户
  deleteUser(id) {
    return service.post('/v1/user/delete', { id })
  },
  
  // 获取用户信息（当前用户）
  getUserInfo() {
    return service.get('/v1/user/info')
  },
  
  // 获取指定用户详情
  getUserDetail(id) {
    return service.get('/v1/user/info', { params: { id } })
  },

  // 获取回调配置（当前用户）
  getCallbackConfig() {
    return service.get('/v1/user/callback_config')
  },

  // 更新回调配置（当前用户）
  updateCallbackConfig(data) {
    return service.post('/v1/user/callback_config/update', data)
  },

  // 测试回调地址
  testCallback(data) {
    return service.post('/v1/user/callback_config/test', data)
  }
}

export default userService
