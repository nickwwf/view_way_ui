import service from './api'

const recognitionService = {
  // 创建识别结果
  createRecognition(data) {
    const sanitizeUrl = v => {
      if (v == null) return ''
      const s = String(v).trim()
      return s.replace(/^`+|`+$/g, '').trim()
    }
    const normalizeImageItem = it => {
      if (!it) return null
      const image_url = sanitizeUrl(it.file_url || it.image_url || it.url)
      if (!image_url) return null
      const thumbnail_url = sanitizeUrl(it.thumbnail_url || it.thumb_url || it.thumb || it.thumbnail)
      const obj = { image_url }
      if (thumbnail_url) obj.thumbnail_url = thumbnail_url
      return obj
    }
    const normalizedUploads = Array.isArray(data?.uploaded_files)
      ? data.uploaded_files.map(normalizeImageItem).filter(Boolean)
      : []
    const images =
      normalizedUploads.length
        ? normalizedUploads
        : Array.isArray(data?.images)
        ? data.images
        : undefined
    const image_urls =
      Array.isArray(data?.image_urls)
        ? data.image_urls
            .map(x => {
              if (!x) return null
              if (typeof x === 'string') return sanitizeUrl(x)
              if (typeof x === 'object') return normalizeImageItem(x)
              return sanitizeUrl(x)
            })
            .filter(Boolean)
        : normalizedUploads.length
        ? normalizedUploads
        : Array.isArray(data)
        ? data
            .map(f => {
              if (!f) return null
              if (typeof f === 'string') return sanitizeUrl(f)
              if (typeof f === 'object') return sanitizeUrl(f.file_url || f.image_url || f.url)
              return sanitizeUrl(f)
            })
            .filter(Boolean)
        : data?.image_url
        ? [sanitizeUrl(data.image_url)].filter(Boolean)
        : []
    const payload = {
      image_urls,
      algorithm_type:
        typeof data?.algorithm_type === 'string'
          ? data.algorithm_type
          : typeof data?.mode === 'string'
          ? data.mode
          : 'standard',
      detect_alg: Array.isArray(data?.detect_alg)
        ? data.detect_alg
        : data?.selectedAlgorithms
        ? data.selectedAlgorithms
        : data?.selectedAlgorithm
        ? [data.selectedAlgorithm]
        : [],
      images
    }
    return service.post('/v1/recognition_result/create', payload)
  },
  
  // 获取识别结果列表
  getRecognitionResults(params) {
    return service.get('/v1/recognition_result/list', { params })
  },
  
  // 更新识别结果
  updateRecognition(id, data) {
    return service.post('/v1/recognition_result/update', { id, ...data })
  },
  
  // 获取识别结果详情
  getRecognitionDetail(id) {
    return service.get(`/v1/recognition_result/detail/${id}`)
  },

  // 首页仪表盘数据
  getDashboard() {
    return service.get('/v1/recognition_result/dashboard')
  }
}

export default recognitionService
