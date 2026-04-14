import service from './api'

const algorithmService = {
  // 新增算法
  createAlgorithm(data) {
    return service.post('/v1/ai_asset_config/create', data)
  },
  
  // 获取算法列表
  getAlgorithms(params) {
    return service.get('/v1/ai_asset_config/list', { params })
  },
  
  // 更新算法
  updateAlgorithm(id, data) {
    return service.post('/v1/ai_asset_config/update', { id, ...data })
  },
  
  // 删除算法
  deleteAlgorithm(id) {
    return service.post('/v1/ai_asset_config/delete', { id })
  },
  
  // 获取算法详情
  getAlgorithmInfo(id) {
    return service.get('/v1/ai_asset_config/info', { params: { id } })
  },
  
  // 获取开启的算法列表（用于下拉框）
  getEnabledAlgorithms() {
    return service.get('/v1/ai_asset_config/algorithm_list')
  }
}

export default algorithmService