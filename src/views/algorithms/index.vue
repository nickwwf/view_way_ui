<template>
  <div class="home-container">
    <div class="main-content">
        <div class="algorithms-page">
          <div class="page-header">
            <h2>算法管理</h2>
            <el-button type="primary" icon="el-icon-plus" @click="handleAddAlgorithm">
              添加算法
            </el-button>
          </div>
          <div class="algorithms-content">
            <el-card class="algorithms-card">
              <div class="filter-bar">
                <el-input
                  v-model="algorithmSearch"
                  placeholder="搜索算法名称"
                  size="small"
                  style="width: 300px;"
                  prefix-icon="el-icon-search"
                />
                <el-button type="primary" size="small" style="margin-left: 12px;" @click="handleAlgorithmSearch">查询</el-button>
                <el-button size="small" style="margin-left: 8px;" @click="handleAlgorithmReset">重置</el-button>
              </div>
              <el-table :data="algorithmsList" style="width: 100%" v-loading="algorithmsLoading">
                <el-table-column type="index" label="序号" width="60" align="center" />
                <el-table-column prop="ai_name" label="算法名称" />
  
                <el-table-column prop="description" label="描述" />
                <el-table-column prop="price" label="单价(元/张)" width="120" align="right">
                  <template slot-scope="scope">
                    ¥ {{ formatAmount(scope.row.price) }}
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100" align="center">
                  <template slot-scope="scope">
                    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                      {{ scope.row.status === 1 ? '启用' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="create_time" label="创建时间" width="180" />
                <el-table-column label="操作" width="180" align="center" fixed="right">
                  <template slot-scope="scope">
                    <el-button type="primary" size="small" @click="editAlgorithm(scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="deleteAlgorithm(scope.row)" style="margin-left: 8px;">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination-wrapper" style="margin-top: 16px;">
                <el-pagination
                  @size-change="handleAlgorithmSizeChange"
                  @current-change="handleAlgorithmCurrentChange"
                  :current-page="algorithmPagination.currentPage"
                  :page-sizes="[10, 20, 50, 100]"
                  :page-size="algorithmPagination.pageSize"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="algorithmPagination.total"
                />
              </div>
            </el-card>
          </div>

          <!-- 算法编辑弹窗 -->
          <el-dialog
            :title="isEditAlgorithm ? '编辑算法' : '添加算法'"
            :visible.sync="showAlgorithmDialog"
            width="600px"
            :close-on-click-modal="false"
          >
            <el-form :model="algorithmForm" label-width="100px">
              <el-form-item label="算法名称" prop="ai_name">
                <el-input v-model="algorithmForm.ai_name" placeholder="请输入算法名称" />
              </el-form-item>
              <el-form-item label="描述" prop="description">
                <el-input type="textarea" v-model="algorithmForm.description" placeholder="请输入算法描述" :rows="3" />
              </el-form-item>
              <el-form-item label="单价" prop="price">
                <el-input-number v-model="algorithmForm.price" :min="0" step="0.01" :precision="2" style="width: 100%" />
              </el-form-item>
              <el-form-item label="状态" prop="status">
                <el-radio-group v-model="algorithmForm.status">
                  <el-radio label="1">启用</el-radio>
                  <el-radio label="2">禁用</el-radio>
                </el-radio-group>
                <div style="font-size: 12px; color: #909399; margin-top: 4px; line-height: 1.2;" v-if="algorithmForm.status === '2'">
                  注：禁用算法不影响已使用该算法的图片历史识别数据。
                </div>
              </el-form-item>
            </el-form>
            <div slot="footer">
              <el-button @click="showAlgorithmDialog = false">取消</el-button>
              <el-button type="primary" @click="saveAlgorithm">保存</el-button>
            </div>
          </el-dialog>
        </div>
      </div>
  </div>
</template>

<script>
import { logout } from '@/services/auth.service'
import algorithmService from '@/services/algorithm.service'

export default {
  name: 'Algorithms',
  data() {
    return {
      showAlgorithmDialog: false,
      isEditAlgorithm: false,
      algorithmSearch: '',
      algorithmsLoading: false,
      algorithmPagination: {
        currentPage: 1,
        pageSize: 10,
        total: 15
      },
      algorithmForm: {
        ai_name: '',
        description: '',
        price: 0,
        status: '1'
      },
      algorithmsList: []
    }
  },
  mounted() {
    this.fetchAlgorithms()
  },
  methods: {
    fetchAlgorithms() {
      this.algorithmsLoading = true
      const params = {
        page: this.algorithmPagination.currentPage,
        page_size: this.algorithmPagination.pageSize,
        search: this.algorithmSearch
      }
      algorithmService.getAlgorithms(params)
        .then(response => {
          if (response.error_code === 0) {
            this.algorithmsList = response.data.items || []
            this.algorithmPagination.total = response.data.total || 0
          } else {
            this.$message.error('获取算法列表失败: ' + response.msg)
          }
        })
        .catch(error => {
          console.error('获取算法列表失败:', error)
          this.$message.error('获取算法列表失败: 网络错误')
        })
        .finally(() => {
          this.algorithmsLoading = false
        })
    },
    handleMenuSelect() {},
    handleSubMenuSelect() {},
    handleUserCommand(command) {
      switch (command) {
        case 'profile':
          this.$message.info('个人中心功能开发中')
          break
        case 'settings':
          this.$message.info('账户设置功能开发中')
          break
        case 'logout':
          logout()
          this.$router.push('/login')
          break
      }
    },
    formatAmount(amount) {
      return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    handleAlgorithmSearch() {
      this.algorithmPagination.currentPage = 1
      this.fetchAlgorithms()
    },
    handleAlgorithmReset() {
      this.algorithmSearch = ''
      this.algorithmPagination.currentPage = 1
      this.fetchAlgorithms()
    },
    handleAlgorithmSizeChange(size) {
      this.algorithmPagination.pageSize = size
      this.algorithmPagination.currentPage = 1
      this.fetchAlgorithms()
    },
    handleAlgorithmCurrentChange(page) {
      this.algorithmPagination.currentPage = page
      this.fetchAlgorithms()
    },
    handleAddAlgorithm() {
      this.isEditAlgorithm = false
      // 重置表单数据
      this.algorithmForm = {
        ai_name: '',
        description: '',
        price: 0,
        status: '1'
      }
      this.showAlgorithmDialog = true
    },
    editAlgorithm(row) {
      this.isEditAlgorithm = true
      this.algorithmsLoading = true
      
      algorithmService.getAlgorithmInfo(row.id)
        .then(response => {
          if (response.error_code === 0) {
            // 只赋值表单需要的字段，避免数据不一致
            this.algorithmForm = {
              id: response.data.id,
              ai_name: response.data.ai_name || '',
              description: response.data.description || '',
              price: response.data.price || 0,
              status: String(response.data.status || '1')
            }
          } else {
            this.$message.error('获取算法详情失败: ' + response.msg)
            // 降级方案：使用列表数据，确保状态字段为字符串
            this.algorithmForm = { 
              ...row,
              status: String(row.status || '1')
            }
          }
        })
        .catch(error => {
          console.error('获取算法详情失败:', error)
          this.$message.error('获取算法详情失败: 网络错误')
          // 降级方案：使用列表数据，确保状态字段为字符串
          this.algorithmForm = { 
            ...row,
            status: String(row.status || '1')
          }
        })
        .finally(() => {
          this.algorithmsLoading = false
          this.showAlgorithmDialog = true
        })
    },
    deleteAlgorithm(row) {
      this.$confirm(`确定要删除算法 ${row.ai_name} 吗？<br><span style="color: #909399; font-size: 12px;">注：删除算法不影响已使用该算法的图片历史识别数据。</span>`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(() => {
        algorithmService.deleteAlgorithm(row.id)
          .then(response => {
            if (response.error_code === 0) {
              this.$message.success('删除成功')
              this.fetchAlgorithms()
            } else {
              this.$message.error('删除失败: ' + response.msg)
            }
          })
          .catch(error => {
            console.error('删除算法失败:', error)
            this.$message.error('删除失败: 网络错误')
          })
      }).catch(() => {
        // 取消删除
      })
    },
    saveAlgorithm() {
      if (!this.algorithmForm.ai_name) {
        this.$message.error('请输入算法名称')
        return
      }
      
      if (this.isEditAlgorithm) {
        algorithmService.updateAlgorithm(this.algorithmForm.id, this.algorithmForm)
          .then(response => {
            if (response.error_code === 0) {
              this.$message.success('编辑成功')
              this.fetchAlgorithms()
            } else {
              this.$message.error('编辑失败: ' + response.msg)
            }
          })
          .catch(error => {
            console.error('编辑算法失败:', error)
            this.$message.error('编辑失败: 网络错误')
          })
      } else {
        // 调用API新增算法
        algorithmService.createAlgorithm(this.algorithmForm)
          .then(response => {
            if (response.error_code === 0) {
              this.$message.success('添加成功')
              this.fetchAlgorithms()
            } else {
              this.$message.error('添加失败: ' + response.msg)
            }
          })
          .catch(error => {
            console.error('添加算法失败:', error)
            this.$message.error('添加失败: 网络错误')
          })
      }
      
      this.showAlgorithmDialog = false
      this.isEditAlgorithm = false
      this.algorithmForm = {
        ai_name: '',
        description: '',
        price: 0,
        status: '1'
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

/* 右侧内容 */
.main-content {
  padding: 8px;
}

.algorithms-page {
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.filter-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
