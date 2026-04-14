<template>
  <div class="home-container">
    <div class="main-content">
      <!-- 图片识别记录组件 -->
      <ImageRecognitionList ref="recognitionList" @upload="showUploadDialog = true" />
    </div>

    <!-- 上传图片弹窗 -->
    <el-dialog
      title="上传图片识别"
      :visible.sync="showUploadDialog"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="!isRecognizing"
      :show-close="!isRecognizing"
      @close="handleCancel"
    >
      <div class="upload-dialog-content" v-loading="isRecognizing" element-loading-text="处理中，请稍候...">
        <div class="upload-preview">
          <h4>已选择 {{ fileList.length }} 张图片</h4>
          <div class="preview-list">
            <div v-for="(file, index) in fileList" :key="index" class="preview-item">
              <div class="image-container">
                <el-image :src="file.url" fit="cover" class="preview-image" />
                <el-button type="text" size="mini" @click="removeFile(index)" class="remove-button">
                  <i class="el-icon-delete"></i>
                </el-button>
              </div>
            </div>
            <el-upload
              ref="uploader"
              :key="uploaderKey"
              action="#"
              multiple
              :file-list="fileList"
              :on-change="handleFileChange"
              :before-upload="beforeUpload"
              :auto-upload="false"
              accept=".png,.jpg,.jpeg,.gif,.bmp,.webp"
              :show-file-list="false"
              class="upload-item"
            >
              <div class="upload-plus-item">
                <i class="el-icon-plus"></i>
                <span>点击选择</span>
              </div>
            </el-upload>
          </div>
        </div>
        <div class="algorithm-selection">
          <h4>选择算法</h4>
          <div class="algorithm-check-all">
            <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
          </div>
          <el-checkbox-group v-model="selectedAlgorithms" @change="handleCheckedAlgorithmsChange">
            <el-checkbox 
              v-for="option in algorithmOptions" 
              :key="option.value" 
              :label="option.value"
            >{{ option.label }}</el-checkbox>
          </el-checkbox-group>
          <h4>识别模式</h4>
          <el-radio-group v-model="recognitionMode">
            <el-radio label="standard">标准模式</el-radio>
            <el-radio label="accurate">高精度模式</el-radio>
          </el-radio-group>
        </div>
      </div>
      <div slot="footer">
        <el-button @click="handleCancel" :disabled="isRecognizing">取消</el-button>
        <el-button 
          type="primary" 
          :disabled="fileList.length === 0 || selectedAlgorithms.length === 0 || isRecognizing" 
          :loading="isRecognizing"
          @click="startRecognition"
        >
          开始识别
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ImageRecognitionList from '@/components/ImageRecognitionList'
import service from '@/services/api'
import recognitionService from '@/services/recognition.service'

export default {
  name: 'Upload',
  components: {
    ImageRecognitionList
  },
  data() {
    return {
      showUploadDialog: false,
      fileList: [],
      selectedAlgorithm: '',
      selectedAlgorithms: [],
      checkAll: false,
      isIndeterminate: false,
      recognitionMode: 'standard',
      algorithmOptions: [],
      isRecognizing: false, // Add new loading state
      uploadingMessage: null,
      creatingMessage: null,
      uploaderKey: 0
    }
  },
  mounted() {
    this.fetchAlgorithmOptions()
    if (this.$route.query && (this.$route.query.open === '1' || this.$route.query.open === 'true')) {
      this.handleCancel() // Clear previous state before opening dialog
      this.showUploadDialog = true
    }
  },
  beforeDestroy() {
    this.closeFloatingMessages()
  },
  methods: {
    closeFloatingMessages() {
      if (this.uploadingMessage && typeof this.uploadingMessage.close === 'function') {
        this.uploadingMessage.close()
      }
      if (this.creatingMessage && typeof this.creatingMessage.close === 'function') {
        this.creatingMessage.close()
      }
      this.uploadingMessage = null
      this.creatingMessage = null
    },
    openUploadingMessage() {
      if (this.uploadingMessage && typeof this.uploadingMessage.close === 'function') {
        this.uploadingMessage.close()
      }
      this.uploadingMessage = this.$message({
        message: '正在上传图片...',
        type: 'info',
        duration: 0
      })
    },
    openCreatingMessage() {
      if (this.creatingMessage && typeof this.creatingMessage.close === 'function') {
        this.creatingMessage.close()
      }
      this.creatingMessage = this.$message({
        message: '正在创建识别任务...',
        type: 'info',
        duration: 0
      })
    },
    // 获取算法列表
    fetchAlgorithmOptions() {
      service.get('/v1/detect/all_rules')
        .then(response => {
          if (response.error_code === 0) {
            this.algorithmOptions = response.data.map(item => ({
              label: item.ai_name,
              value: item.id
            }))
          } else {
            this.$message.error('获取算法列表失败: ' + response.msg)
          }
        })
        .catch(error => {
          console.error('获取算法列表失败:', error)
          this.$message.error('获取算法列表失败: 网络错误')
        })
    },
    handleFileChange(file, fileList) {
      if (fileList.length > 10) {
        this.$message.error('最多只能上传 10 张图片')
        // 截取前10个文件并确保它们都有预览URL
        const slicedList = fileList.slice(0, 10)
        slicedList.forEach(item => {
          if (item.raw && !item.url) {
            item.url = URL.createObjectURL(item.raw)
          }
        })
        this.fileList = slicedList
        return
      }
      // 为当前文件添加预览URL
      if (file.raw && !file.url) {
        file.url = URL.createObjectURL(file.raw)
      }
      // 确保所有文件都有预览URL
      fileList.forEach(item => {
        if (item.raw && !item.url) {
          item.url = URL.createObjectURL(item.raw)
        }
      })
      this.fileList = fileList
    },
    handleFileRemove(file, fileList) {
      this.fileList = fileList
    },
    removeFile(index) {
      this.fileList.splice(index, 1)
    },
    beforeUpload(file) {
      const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']
      const fileExt = file.name.split('.').pop().toLowerCase()
      const isAllowedExt = allowedExtensions.includes(fileExt)
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isAllowedExt) {
        this.$message.error(`不支持该图片格式！仅支持: ${allowedExtensions.join(', ')}`)
        return false
      }
      if (!isLt5M) {
        this.$message.error('图片大小不能超过 5MB！')
        return false
      }
      return true
    },
    startRecognition() {
      if (this.selectedAlgorithms.length === 0) {
        this.$message.error('请选择算法')
        return
      }
      if (this.fileList.length === 0) {
        this.$message.error('请选择图片')
        return
      }
      
      this.isRecognizing = true // Set loading state to true
      
      const formData = new FormData()
      this.fileList.forEach(file => {
        formData.append('files', file.raw)
      })
      formData.append('sub_folder', 'uploads')
      
      this.openUploadingMessage()
      
      service.post('/v1/task_image/upload_multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        console.log('上传响应:', response)
        if (response.error_code === 0) {
          const { uploaded_files, failed_count } = response.data
          if (failed_count > 0) {
            this.$message.error(`${failed_count} 张图片上传失败，请重试`)
            this.closeFloatingMessages() // 提前关闭消息
            return
          }
          if (uploaded_files && uploaded_files.length > 0) {
            this.createRecognition(uploaded_files)
          }
        } else {
            this.$message.error('上传失败: ' + response.msg)
            this.closeFloatingMessages() // 提前关闭消息
          }
      })
      .catch(error => {
        console.error('上传失败:', error)
        this.$message.error('上传失败: ' + (error.message || '网络错误'))
        this.closeFloatingMessages() // 提前关闭消息
      })
      .finally(() => {
        this.isRecognizing = false // Reset loading state
        if (this.uploadingMessage && typeof this.uploadingMessage.close === 'function') {
          this.uploadingMessage.close()
        }
        this.uploadingMessage = null
      })
    },
    createRecognition(uploadedFiles) {
      const recognitionData = {
        image_urls: uploadedFiles.map(f => ({ image_url: f.file_url, thumbnail_url: f.thumbnail_url })),
        algorithm_type: this.recognitionMode,
        detect_alg: this.selectedAlgorithms
      }

      this.openCreatingMessage()

      recognitionService.createRecognition(recognitionData)
        .then(response => {
          if (response.error_code === 0) {
            this.$message.success('识别任务创建成功')
            this.showUploadDialog = false
            this.fileList = []
            this.selectedAlgorithms = []
            this.checkAll = false
            this.isIndeterminate = false
            this.recognitionMode = 'standard'
            this.refreshData()
          } else {
            this.$message.error('创建识别任务失败: ' + response.msg)
            this.closeFloatingMessages() // 提前关闭消息
          }
        })
        .catch(error => {
        console.error('创建识别任务失败:', error)
        this.$message.error('创建识别任务失败: ' + (error.message || '网络错误'))
        this.closeFloatingMessages() // 提前关闭消息
      })
      .finally(() => {
        this.isRecognizing = false // Reset loading state
        if (this.creatingMessage && typeof this.creatingMessage.close === 'function') {
          this.creatingMessage.close()
        }
        this.creatingMessage = null
      })
    },
    handleCancel() {
      this.closeFloatingMessages()
      if (this.$refs.uploader) {
        this.$refs.uploader.clearFiles()
      }
      this.uploaderKey += 1
      // 清空数据
      this.fileList = []
      this.selectedAlgorithm = ''
      this.selectedAlgorithms = []
      this.checkAll = false
      this.isIndeterminate = false
      this.recognitionMode = 'standard'
      this.isRecognizing = false // Reset loading state on cancel
      // 关闭弹窗
      this.showUploadDialog = false
    },
    handleCheckAllChange(val) {
      this.selectedAlgorithms = val ? this.algorithmOptions.map(item => item.value) : []
      this.isIndeterminate = false
    },
    handleCheckedAlgorithmsChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.algorithmOptions.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.algorithmOptions.length
    },
    refreshData() {
      this.$message.success('数据已刷新')
      // 这里可以调用组件的方法来刷新数据
      if (this.$refs.recognitionList) {
        this.$refs.recognitionList.refreshData()
      }
    }
  },
  watch: {
    '$route.query.open'(val) {
      if (val === '1' || val === 'true') {
        this.handleCancel() // Clear previous state before opening dialog
        this.showUploadDialog = true
      }
    }
  }
}
</script>

<style scoped>
.home-container {
  width: 100%;
  min-height: 100vh;
  background-color: var(--color-page-bg);
}

/* 主内容区 */
.main-content {
  padding: 8px;
  background: var(--color-page-bg);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #1f2329;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.header-actions .el-button {
  min-width: 110px;
  height: 36px;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.header-actions .el-button:hover {
  transform: translateY(-1px);
}

.header-actions .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.header-actions .el-button--primary:hover {
  background: linear-gradient(135deg, #5568d3 0%, #63408a 100%);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* 上传弹窗样式 */
.upload-tips li {
  margin-bottom: 4px;
}

.upload-area {
  margin-bottom: 24px;
}

.upload-actions {
  border-top: 1px solid #e8e8e8;
  padding-top: 20px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.upload-dialog-content {
  padding: 10px 20px;
}

/* 上传区域 */
.upload-demo {
  margin-bottom: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 16px;
  background: #fff;
}

.upload-plus-button {
  width: 100%;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fff;
}

.upload-plus-button:hover {
  border-color: #1890ff;
  background-color: #f6f9ff;
}

.upload-plus-button i {
  font-size: 24px;
  color: #999;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.upload-plus-button:hover i {
  color: #1890ff;
}

.upload-plus-button span {
  font-size: 12px;
  color: #999;
  transition: all 0.3s ease;
}

.upload-plus-button:hover span {
  color: #1890ff;
}

/* 上传预览区域 */
.upload-preview {
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

.upload-preview h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-preview h4::before {
  content: '';
  width: 4px;
  height: 16px;
  background: #1890ff;
  border-radius: 2px;
}

.preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  max-height: 100px;
  overflow-y: auto;
}

.preview-item {
  flex: 0 0 auto;
  margin-right: 12px;
}

.image-container {
  position: relative;
  width: 80px;
  height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: #fafafa;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.image-container:hover {
  border-color: #1890ff;
  background-color: #f6f9ff;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 4px;
}

.remove-button {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 12px;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 10;
}

.image-container:hover .remove-button {
  opacity: 1;
}

.remove-button:hover {
  background: rgba(245, 108, 108, 0.8);
  color: #fff;
}

.remove-button i {
  font-size: 10px;
}

/* 上传项样式 */
.upload-item {
  flex: 0 0 auto;
  margin-right: 12px;
}

.upload-plus-item {
  width: 80px;
  height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.upload-plus-item:hover {
  border-color: #1890ff;
  background-color: #f6f9ff;
}

.upload-plus-item i {
  font-size: 24px;
  color: #999;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.upload-plus-item:hover i {
  color: #1890ff;
}

.upload-plus-item span {
  font-size: 10px;
  color: #999;
  transition: all 0.3s ease;
}

.upload-plus-item:hover span {
  color: #1890ff;
}

/* 算法选择区域 */
.algorithm-selection {
  margin-top: 20px;
}

.algorithm-selection h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.algorithm-selection h4::before {
  content: '';
  width: 4px;
  height: 16px;
  background: #1890ff;
  border-radius: 2px;
}

.algorithm-check-all {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.algorithm-check-all .el-checkbox {
  font-weight: 600;
}

.algorithm-selection .el-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.algorithm-selection .el-checkbox {
  font-size: 14px;
}

.algorithm-selection .el-radio-group {
  display: flex;
  gap: 20px;
}

.algorithm-selection .el-radio {
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content { padding: 8px; }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .header-actions .el-button {
    flex: 1;
  }
}
</style>
