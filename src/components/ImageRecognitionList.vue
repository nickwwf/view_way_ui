<template>
  <div class="image-recognition-list">
    <div class="section-header">
      <div class="header-actions">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button label="realtime">实时识别</el-radio-button>
          <el-radio-button label="history">历史记录</el-radio-button>
        </el-radio-group>
      </div>
      <div class="right-actions">
        <el-button icon="el-icon-refresh" size="small" @click="refreshData">刷新</el-button>
        <el-button type="primary" size="small" icon="el-icon-upload2" @click="$emit('upload')">
          图片上传
        </el-button>
      </div>
    </div>

    <!-- 实时识别视图 -->
    <div v-if="viewMode === 'realtime'" class="realtime-view">
      <div class="realtime-grid">
        <div 
          v-for="(item, index) in paginatedRealtimeImages" 
          :key="index"
          class="realtime-item"
          :class="{ 'new-item': item.isNew }"
        >
          <div class="image-wrapper">
            <img :src="item.thumbnail" :alt="item.imageId" />
            <div class="recognition-overlay" v-if="item.result">
              <div class="result-badge" :style="{ backgroundColor: getAlgorithmColor(item.algorithm) + 'dd' }">{{ item.result.label }}</div>
              <div class="confidence-badge" :class="getConfidenceClass(item.result.confidence)">
                {{ item.result.confidence }}%
              </div>
            </div>
            <div class="processing-overlay" v-else>
              <i class="el-icon-loading"></i>
              <span>识别中...</span>
            </div>
          </div>
          <div class="image-info">
            <div class="info-row">
              <span class="value time-value">{{ item.time }}</span>
              <span
                class="status-badge"
                :class="{
                  'status-completed': item.statusCode === 'success' || item.statusCode === 'output',
                  'status-processing': item.statusCode === 'processing' || item.statusCode === 'waiting',
                  'status-failed': item.statusCode === 'fail'
                }"
              >
                {{ item.statusText }}
              </span>
            </div>
            <div class="info-row">
              <span class="value cost-value">¥ {{ formatAmount(item.cost) }}</span>
              <el-button type="text" size="small" class="detail-button" @click="showDetail(item)">详情</el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          @size-change="handleRealtimeSizeChange"
          @current-change="handleRealtimeCurrentChange"
          :current-page="realtimePagination.currentPage"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="realtimePagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="realtimePagination.total"
        />
      </div>
    </div>

    <!-- 历史记录视图 -->
    <div v-else class="history-view">
      <div class="filter-bar">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
          style="width: 240px;"
        />
        <el-select v-model="filterAlgorithm" placeholder="选择算法" size="small" clearable style="width: 150px;">
          <el-option label="目标检测" value="detection" />
          <el-option label="人脸识别" value="face" />
          <el-option label="OCR识别" value="ocr" />
          <el-option label="图像分类" value="classification" />
        </el-select>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索图片ID"
          size="small"
          style="width: 200px;"
          prefix-icon="el-icon-search"
        />
        <el-button type="primary" size="small" @click="handleSearch">查询</el-button>
        <el-button size="small" @click="handleReset">重置</el-button>
      </div>

      <el-table :data="historyImages" style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="缩略图" width="100" align="center">
          <template slot-scope="scope">
            <el-image 
              :src="scope.row.thumbnail" 
              :preview-src-list="[scope.row.imageUrl]"
              style="width: 60px; height: 60px; border-radius: 4px;"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="imageId" label="图片ID" width="140" />
        <el-table-column prop="algorithm" label="识别模式" width="120" />
        <el-table-column prop="statusText" label="状态" width="110" align="center">
          <template slot-scope="scope">
            <el-tag size="mini" :type="scope.row.statusTagType">{{ scope.row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="result" label="识别结果">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.result" :type="getResultType(scope.row.result)" size="small">
              {{ scope.row.result.label }}
            </el-tag>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column> -->
        <!-- <el-table-column prop="confidence" label="置信度" width="100" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.confidence" :class="getConfidenceClass(scope.row.confidence)">
              {{ scope.row.confidence }}%
            </span>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column> -->
        <el-table-column prop="cost" label="消耗金额" width="100" align="right">
          <template slot-scope="scope">
            <span class="cost-amount">¥ {{ formatAmount(scope.row.cost) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="识别时间" width="160" />
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewDetail(scope.row)">详情</el-button>
            <el-button type="text" size="small" @click="downloadImage(scope.row)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
        />
      </div>
    </div>

    
  </div>
</template>

<script>
import recognitionService from '@/services/recognition.service'

export default {
  name: 'ImageRecognitionList',
  data() {
    return {
      viewMode: 'realtime',
      loading: false,
      
      dateRange: null,
      filterAlgorithm: '',
      searchKeyword: '',
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      realtimePagination: {
        currentPage: 1,
        pageSize: 30,
        total: 0
      },
      realtimeImages: [],
      historyImages: [],
      refreshTimer: null
    }
  },
  mounted() {
    this.fetchRecognitionData()
    // 设置定时刷新，每10秒刷新一次实时数据
    this.refreshTimer = setInterval(() => {
      if (this.viewMode === 'realtime') {
        this.fetchRecognitionData()
      }
    }, 10000)
  },
  beforeDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
  },
  watch: {
    viewMode() {
      this.pagination.currentPage = 1
      this.fetchRecognitionData()
    }
  },
  computed: {
    getProgressColor() {
      return [
        { color: '#f56c6c', percentage: 60 },
        { color: '#e6a23c', percentage: 80 },
        { color: '#67c23a', percentage: 100 }
      ]
    },
    
    paginatedRealtimeImages() {
      // 因为现在每次从后端请求的已经是当前页的数据，不需要再 slice
      // （如果后端没做分页，这里再根据 currentPage 截取会导致数据对不上，但你反馈的是“接口返回的分页数据没显示正确”）
      return this.realtimeImages
    }
  },
  methods: {
    // 从后端API获取识别结果数据
    fetchRecognitionData() {
      this.loading = true
      
      // 获取当前用户ID（这里需要根据实际登录用户获取）
      const user_id = 'current_user_id' // 需要根据实际登录用户替换
      
      const params = {
        user_id: user_id,
        page: this.viewMode === 'realtime' ? this.realtimePagination.currentPage : this.pagination.currentPage,
        page_size: this.viewMode === 'realtime' ? this.realtimePagination.pageSize : this.pagination.pageSize
      }
      if (this.viewMode === 'history') {
        params.status = 'success,output,fail'
      }
      else {
        params.status = 'waiting,processing'
      }
      
      recognitionService.getRecognitionResults(params)
        .then(response => {
          if (response.error_code === 0) {
            // 将后端数据转换为前端需要的格式
            const transformed = this.transformRecognitionData(response.data.items || [])
            if (this.viewMode === 'realtime') {
              this.realtimeImages = transformed
              this.realtimePagination.total = response.data.total || 0
            } else {
              this.historyImages = transformed
              this.pagination.total = response.data.total || 0
            }
            
            // 如果是实时模式，因为现在后端直接按分页返回了对应条数，不需要前端再次 slice
            // (前提是后端真的做了分页处理。如果后端依然返回所有数据，可以保留 slice)
          } else {
            this.$message.error('获取识别结果失败: ' + response.msg)
          }
        })
        .catch(error => {
          console.error('获取识别结果失败:', error)
          this.$message.error('获取识别结果失败: 网络错误')
        })
        .finally(() => {
          this.loading = false
        })
    },
    
    // 将后端数据转换为前端格式
    transformRecognitionData(data) {
      return data.map(item => {
        const nodeStatus = this.normalizeNodeStatus(item.status)
        const modeLabel = this.getModeLabel(item.algorithm_type)
        return ({
          imageId: item.id || item.image_no,
          imageUrl: item.image_url || 'https://via.placeholder.com/300x200/667eea/ffffff?text=Image',
          thumbnail: item.thumbnail_url || item.image_url || 'https://via.placeholder.com/60',
          algorithm: modeLabel,
        algorithmVersion: 'v1.0.0',
        time: item.create_time || new Date().toLocaleString('zh-CN'),
          cost: (typeof item.consumption === 'number' ? item.consumption : (item.consumption != null ? Number(item.consumption) : (item.cost != null ? Number(item.cost) : 0.5))),
        processTime: item.process_time || 850,
        confidence: item.confidence || (item.recognition_result ? item.recognition_result.confidence : 0),
        result: item.recognition_result || null,
          statusCode: nodeStatus.code,
          statusText: nodeStatus.text,
          statusTagType: nodeStatus.tagType,
          isNew: this.isNewItem(item.create_time)
        })
      })
    },

    normalizeNodeStatus(nodeType) {
      const t = (nodeType || '').toString()
      if (t === 'waiting') return { code: 'waiting', text: '待识别', tagType: 'info' }
      if (t === 'processing') return { code: 'processing', text: '识别中', tagType: 'warning' }
      if (t === 'success') return { code: 'success', text: '已完成', tagType: 'success' }
      if (t === 'fail') return { code: 'fail', text: '失败', tagType: 'danger' }
      if (t === 'output') return { code: 'output', text: '已输出', tagType: 'success' }
      if (!t) return { code: 'unknown', text: '未知', tagType: 'info' }
      return { code: t, text: t, tagType: 'info' }
    },

    getModeLabel(mode) {
      if (mode === 'standard') return '标准模式'
      if (mode === 'accurate') return '高精度模式'
      return mode || '未知'
    },
    
    // 显示详情
    showDetail(item) {
      if (!item || !item.imageId) {
        this.$message.warning('缺少识别记录ID')
        return
      }
      this.$router.push(`/recognition/${item.imageId}`)
    },
    
    // 判断是否为新项目（最近5分钟内创建的）
    isNewItem(createTime) {
      if (!createTime) return false
      const createDate = new Date(createTime)
      const now = new Date()
      const diff = now.getTime() - createDate.getTime()
      return diff < 5 * 60 * 1000 // 5分钟内
    },
    
    formatAmount(amount) {
      return amount.toFixed(2)
    },
    getConfidenceClass(confidence) {
      if (confidence >= 90) return 'high-confidence'
      if (confidence >= 70) return 'medium-confidence'
      return 'low-confidence'
    },
    getResultType(result) {
      const confidence = result.confidence || 0
      if (confidence >= 90) return 'success'
      if (confidence >= 70) return 'warning'
      return 'danger'
    },
    refreshData() {
      this.fetchRecognitionData()
    },
    handleSearch() {
      this.$message.info('执行搜索')
    },
    handleReset() {
      this.dateRange = null
      this.filterAlgorithm = ''
      this.searchKeyword = ''
    },
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.currentPage = 1
      this.fetchRecognitionData()
    },
    handleCurrentChange(page) {
      this.pagination.currentPage = page
      this.fetchRecognitionData()
    },
    handleRealtimeSizeChange(size) {
      this.realtimePagination.pageSize = size
      this.realtimePagination.currentPage = 1
      this.fetchRecognitionData()
    },
    handleRealtimeCurrentChange(page) {
      this.realtimePagination.currentPage = page
      this.fetchRecognitionData()
    },
    viewDetail(row) {
      this.showDetail(row)
    },
    downloadImage(row) {
      if (!row || !row.imageUrl) {
        this.$message.warning('图片地址不存在，无法下载')
        return
      }
      this.$message.info(`正在准备下载图片: ${row.imageId}...`)
      
      fetch(row.imageUrl)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok')
          return response.blob()
        })
        .then(blob => {
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = row.imageId || 'download.png'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          this.$message.success('下载成功')
        })
        .catch(error => {
          console.error('下载图片失败:', error)
          this.$message.error('下载失败，请尝试右键另存为')
          // 降级方案：直接打开
          window.open(row.imageUrl, '_blank')
        })
    },
    getAlgorithmColor(algorithm) {
      if (algorithm.includes('目标检测')) return '#43e97b'
      if (algorithm.includes('人脸')) return '#fa709a'
      if (algorithm.includes('OCR')) return '#fee140'
      if (algorithm.includes('图像分类')) return '#30cfd0'
      return '#667eea'
    }
  }
}
</script>

<style scoped>
/* 主容器 */
.image-recognition-list {
  background: #ffffff;
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 头部区域 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  align-items: center;
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.right-actions .el-button {
  transition: all 0.2s ease;
  border-radius: 6px;
}

.right-actions .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(64, 158, 255, 0.25);
}

/* 视图容器 */
.history-view,
.realtime-view {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fafbfc;
  border-radius: 6px;
  padding: 8px;
}

.realtime-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  flex: 1;
  overflow-y: auto;
  padding: 4px;
}

/* 实时识别卡片 */
.realtime-item {
  border: 1px solid #e4e9f2;
  border-radius: 8px;
  overflow: hidden;
  height: 220px;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.realtime-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #d0e3ff;
}

.realtime-item.new-item {
  border-color: #67c23a;
  animation: highlight 2s ease forwards;
}

@keyframes highlight {
  0% { box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.3); }
  100% { box-shadow: none; }
}

.image-wrapper {
  position: relative;
  width: 100%;
  flex: 1;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recognition-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(10, 20, 60, 0.75) 0%, transparent 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 10px;
  gap: 5px;
}

.result-badge {
  background: rgba(64, 158, 255, 0.92);
  color: #fff;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  backdrop-filter: blur(4px);
}

.confidence-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  color: #fff;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.high-confidence { background: rgba(82, 196, 26, 0.9); }
.medium-confidence { background: rgba(250, 173, 20, 0.9); }
.low-confidence { background: rgba(245, 108, 108, 0.9); }

.processing-overlay {
  position: absolute;
  inset: 0;
  background: transparent;
  display: none;
}

.processing-overlay i {
  display: none;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.image-info {
  padding: 8px 10px;
  background: #fafbff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-top: 1px solid #eef1fb;
  height: 60px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 11px;
  line-height: 1.5;
}

.info-row:last-child { margin-bottom: 0; }

.info-row .value {
  color: #2d3748;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time-value {
  font-size: 12px;
  color: #718096;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
}

.status-completed {
  background: #f0f9ff;
  color: #16a34a;
  border: 1px solid #dcfce7;
}

.status-processing {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}

.detail-button {
  font-size: 10px;
  padding: 0 4px;
  color: #3b82f6;
}

.detail-button:hover {
  color: #2563eb;
  text-decoration: underline;
}

.cost-value {
  color: #e53e3e;
  font-weight: 700;
  font-size: 13px;
  text-shadow: 0 1px 2px rgba(229, 62, 62, 0.2);
}

/* 历史记录筛选栏 */
.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
  align-items: center;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 6px;
  border: 1px solid #e4e9f2;
}

.filter-bar .el-button {
  border-radius: 6px;
  transition: all 0.2s ease;
}

.filter-bar .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.cost-amount {
  color: #e53e3e;
  font-weight: 600;
  font-size: 13px;
}

.text-gray { color: #a0aec0; }

.pagination-wrapper {
  margin-top: 4px;
  display: flex;
  justify-content: center;
  padding: 6px 10px;
  background: #f5f7fa;
  border-radius: 6px;
  border: 1px solid #e4e9f2;
}

/* 表格样式 */
.el-table {
  border-radius: 6px;
  overflow: hidden;
  box-shadow: none;
  border: 1px solid #e4e9f2;
}

.el-table th {
  background: #f5f7fa !important;
  font-weight: 600;
  color: #4a5568;
  font-size: 13px;
  border-bottom: 1px solid #e4e9f2 !important;
}

.el-table tr:hover > td {
  background: #f0f6ff !important;
}

.el-table tr:nth-child(even) {
  background: #fafbfc !important;
}

.el-table tr:nth-child(odd) {
  background: #ffffff !important;
}

.image-id-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-thumbnail {
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

/* 详情弹窗样式 */
.custom-dialog .el-dialog__header {
  background: #fff;
  padding: 18px 20px;
  border-bottom: 1px solid #e4e9f2;
  border-radius: 8px 8px 0 0;
}

.custom-dialog .el-dialog__title {
  color: #1a202c;
  font-size: 16px;
  font-weight: 600;
}

.custom-dialog .el-dialog__body {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 0 0 8px 8px;
}

/* 时间线样式 */
.recognition-timeline {
  margin-bottom: 16px;
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e4e9f2;
  border-left: 3px solid #409eff;
}

.recognition-timeline h4 {
  color: #2d3748;
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
}

.timeline-wrapper {
  position: relative;
  padding-left: 32px;
}

.timeline-wrapper::before {
  content: '';
  position: absolute;
  left: 12px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: linear-gradient(180deg, #c8d8f8, #e8eeff);
  border-radius: 1px;
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-time {
  font-size: 11px;
  color: #718096;
  margin-bottom: 4px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-weight: 500;
}

.timeline-dot {
  position: absolute;
  left: -32px;
  top: 6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #409eff;
  border: 3px solid #e8f4ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
}

.timeline-item.created .timeline-dot {
  background: #43e97b;
  border-color: #e6f7ee;
  box-shadow: 0 2px 8px rgba(67, 233, 123, 0.4);
}

.timeline-item.processing .timeline-dot {
  background: #fee140;
  border-color: #fff8ee;
  box-shadow: 0 2px 8px rgba(254, 225, 64, 0.4);
  animation: pulse 1.8s infinite;
}

.timeline-item.completed .timeline-dot {
  background: #667eea;
  border-color: #e8eeff;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(254, 225, 64, 0.6); }
  70% { box-shadow: 0 0 0 8px rgba(254, 225, 64, 0); }
  100% { box-shadow: 0 0 0 0 rgba(254, 225, 64, 0); }
}

.timeline-content {
  background: #fff;
  padding: 12px 14px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border-left: 3px solid #409eff;
  transition: transform 0.2s ease;
}

.timeline-item:hover .timeline-content {
  transform: translateX(3px);
}

.timeline-item.created .timeline-content { border-left-color: #52c41a; }
.timeline-item.processing .timeline-content { border-left-color: #faad14; }
.timeline-item.completed .timeline-content { border-left-color: #409eff; }

.timeline-title {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 6px;
}

.timeline-desc {
  font-size: 13px;
  color: #718096;
  line-height: 1.6;
}

/* 详情信息样式 */
.detail-image {
  margin-bottom: 16px;
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e4e9f2;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-section {
  background: #ffffff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e4e9f2;
  border-left: 3px solid #409eff;
}

.info-section h4 {
  color: #2d3748;
  margin: 0 0 14px 0;
  font-size: 14px;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item .label {
  font-size: 13px;
  color: #718096;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span:not(.label) {
  font-size: 14px;
  color: #2d3748;
  font-weight: 600;
  line-height: 1.4;
}

/* 结果详情样式 */
.result-detail {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 14px;
  border: 1px solid #e4e9f2;
}

.result-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.result-item:last-child {
  margin-bottom: 0;
}

.result-item .label {
  width: 100px;
  flex-shrink: 0;
  font-size: 13px;
  color: #718096;
  font-weight: 600;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.result-json {
  flex: 1;
  background: #fff;
  border: 1px solid #e0e8ff;
  border-radius: 8px;
  padding: 14px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  overflow-x: auto;
  color: #4a5568;
  line-height: 1.6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table-thumbnail:hover { transform: scale(1.15); }

.detail-content {
  max-height: 600px;
  overflow-y: auto;
  padding: 4px 8px;
  scrollbar-width: thin;
  scrollbar-color: #c8d8f8 #f0f4ff;
}

.detail-content::-webkit-scrollbar {
  width: 6px;
}

.detail-content::-webkit-scrollbar-track {
  background: #f0f4ff;
  border-radius: 3px;
}

.detail-content::-webkit-scrollbar-thumb {
  background: #c8d8f8;
  border-radius: 3px;
}

.detail-content::-webkit-scrollbar-thumb:hover {
  background: #a0b8f0;
}

</style>
