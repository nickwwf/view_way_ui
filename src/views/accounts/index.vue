<template>
  <div class="home-container">

    <!-- 主内容区 -->
    <div class="main-content">
        <div class="accounts-page">
          <div class="page-header">
            <h2>账户管理</h2>
            <el-button type="primary" icon="el-icon-plus" @click="handleAddAccount">
              添加账户
            </el-button>
          </div>
          <div class="accounts-content">
            <el-card class="accounts-card">
              <div class="filter-bar">
                <el-input
                  v-model="accountSearch"
                  placeholder="搜索用户名或App Key"
                  size="small"
                  style="width: 300px;"
                  prefix-icon="el-icon-search"
                />
                <el-select v-model="accountStatus" placeholder="状态" size="small" clearable style="width: 120px; margin-left: 12px;">
                  <el-option label="开启" value="1" />
                  <el-option label="关闭" value="2" />
                </el-select>
                <el-button type="primary" size="small" style="margin-left: 12px;" @click="handleAccountSearch">查询</el-button>
                <el-button size="small" style="margin-left: 8px;" @click="handleAccountReset">重置</el-button>
              </div>
              <el-table :data="accountsList" style="width: 100%" v-loading="accountsLoading">
                <el-table-column type="index" label="序号" width="60" align="center" />
                <el-table-column prop="user_name" label="用户名" />
                <el-table-column prop="status" label="状态" width="100" align="center">
                  <template slot-scope="scope">
                    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                      {{ scope.row.status === 1 ? '开启' : '关闭' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="balance" label="余额" width="120" align="right">
                  <template slot-scope="scope">
                    ¥ {{ formatAmount(scope.row.balance) }}
                  </template>
                </el-table-column>
                <el-table-column prop="ai_asset" label="算法信息" width="200">
                  <template slot-scope="scope">
                    <div v-if="scope.row.ai_asset && scope.row.ai_asset.length > 0">
                      <el-tag 
                        v-for="asset in scope.row.ai_asset" 
                        :key="asset" 
                        size="small" 
                        style="margin-right: 4px; margin-bottom: 4px;"
                      >
                        {{ getAlgorithmName(asset) }}
                      </el-tag>
                    </div>
                    <span v-else style="color: #999;">未选择算法</span>
                  </template>
                </el-table-column>
                <el-table-column prop="app_key" label="App Key" />
                <el-table-column prop="app_secret" label="App Secret" />
                <el-table-column prop="create_time" label="创建时间" width="180" />
                <el-table-column label="操作" width="180" align="center" fixed="right">
                  <template slot-scope="scope">
                    <el-button type="primary" size="small" @click="editAccount(scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="deleteAccount(scope.row)" style="margin-left: 8px;">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination-wrapper" style="margin-top: 16px;">
                <el-pagination
                  @size-change="handleAccountSizeChange"
                  @current-change="handleAccountCurrentChange"
                  :current-page="accountPagination.currentPage"
                  :page-sizes="[10, 20, 50, 100]"
                  :page-size="accountPagination.pageSize"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="accountPagination.total"
                />
              </div>
            </el-card>
          </div>

          <!-- 账户编辑弹窗 -->
          <el-dialog
            :title="isEditAccount ? '编辑账户' : '添加账户'"
            :visible.sync="showAccountDialog"
            width="600px"
            :close-on-click-modal="false"
          >
            <el-form :model="accountForm" label-width="100px">
              <el-form-item label="用户名" prop="user_name">
                <el-input v-model="accountForm.user_name" placeholder="请输入用户名" />
              </el-form-item>
              <el-form-item label="状态" prop="status">
                <el-radio-group v-model="accountForm.status">
                  <el-radio label="1">开启</el-radio>
                  <el-radio label="2">关闭</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="余额" prop="balance">
                <el-input-number v-model="accountForm.balance" :min="0" step="0.01" :precision="2" style="width: 100%" />
              </el-form-item>
              <el-form-item label="AI算法" prop="ai_asset">
                <el-select v-model="accountForm.ai_asset" multiple placeholder="选择AI算法" style="width: 100%">
                  <el-option 
                    v-for="algorithm in algorithmOptions" 
                    :key="algorithm.id"
                    :label="algorithm.ai_name" 
                    :value="algorithm.id" 
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="App Key" prop="app_key" v-if="!isEditAccount">
                <el-input v-model="accountForm.app_key" placeholder="后端自动生成" readonly />
              </el-form-item>
              <el-form-item label="App Secret" prop="app_secret" v-if="!isEditAccount">
                <el-input v-model="accountForm.app_secret" placeholder="后端自动生成" readonly />
              </el-form-item>
            </el-form>
            <div slot="footer">
              <el-button @click="showAccountDialog = false">取消</el-button>
              <el-button type="primary" @click="saveAccount">保存</el-button>
            </div>
          </el-dialog>
        </div>
      </div>
  </div>
</template>

<script>
import { logout } from '@/services/auth.service'
import userService from '@/services/user.service'
import algorithmService from '@/services/algorithm.service'

export default {
  name: 'Accounts',
  data() {
    return {
      showAccountDialog: false,
      isEditAccount: false,
      accountSearch: '',
      accountStatus: '',
      accountsLoading: false,
      accountPagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      accountForm: {
        user_name: '',
        status: '1',
        balance: 0,
        ai_asset: [],
        app_key: '',
        app_secret: ''
      },
      accountsList: [],
      algorithmOptions: [] // 存储从后端获取的算法列表
    }
  },
  mounted() {
    this.fetchUsers()
    this.fetchAlgorithmOptions()
  },
  methods: {
    fetchAlgorithmOptions() {
      algorithmService.getEnabledAlgorithms()
        .then(response => {
          if (response.error_code === 0) {
            this.algorithmOptions = response.data || []
          } else {
            this.$message.error('获取算法列表失败: ' + response.msg)
          }
        })
        .catch(error => {
          console.error('获取算法列表失败:', error)
          this.$message.error('获取算法列表失败: 网络错误')
        })
    },
    fetchUsers() {
      this.accountsLoading = true
      const params = {
        page: this.accountPagination.currentPage,
        page_size: this.accountPagination.pageSize
      }
      
      if (this.accountSearch) {
        params.search = this.accountSearch
      }
      if (this.accountStatus) {
        params.status = this.accountStatus
      }
      
      userService.getUsers(params)
        .then(response => {
          if (response.error_code === 0) {
            this.accountsList = response.data.items || []
            this.accountPagination.total = response.data.total || 0
          } else {
            this.$message.error('获取用户列表失败: ' + response.msg)
          }
        })
        .catch(error => {
          console.error('获取用户列表失败:', error)
          this.$message.error('获取用户列表失败: 网络错误')
        })
        .finally(() => {
          this.accountsLoading = false
        })
    },
    handleMenuSelect() {},
    handleSubMenuSelect() {},
    handleUserCommand(command) {
      switch (command) {
        case 'profile':
          this.$message.info('接入文档')
          this.$router.push('/settings')
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
    getAlgorithmName(asset) {
      const algorithmMap = {
        'detection': '目标检测',
        'face': '人脸识别', 
        'ocr': 'OCR识别',
        'classification': '图像分类'
      }
      return algorithmMap[asset] || asset
    },
    handleAccountSearch() {
      this.accountPagination.currentPage = 1
      this.fetchUsers()
    },
    handleAccountReset() {
      this.accountSearch = ''
      this.accountStatus = ''
      this.accountPagination.currentPage = 1
      this.fetchUsers()
    },
    handleAccountSizeChange(size) {
      this.accountPagination.pageSize = size
      this.accountPagination.currentPage = 1
      this.fetchUsers()
    },
    handleAccountCurrentChange(page) {
      this.accountPagination.currentPage = page
      this.fetchUsers()
    },
    handleAddAccount() {
      this.isEditAccount = false
      // 重置表单数据
      this.accountForm = {
        user_name: '',
        status: '1',
        balance: 0,
        ai_asset: [],
        app_key: '',
        app_secret: ''
      }
      this.showAccountDialog = true
    },
    editAccount(row) {
      this.isEditAccount = true
      this.accountsLoading = true
      
      userService.getUserDetail(row.id)
        .then(response => {
          if (response.error_code === 0) {
            // 只赋值表单需要的字段，避免数据不一致
            this.accountForm = {
              id: response.data.id,
              user_name: response.data.user_name || '',
              status: String(response.data.status || '1'),
              balance: response.data.balance || 0,
              ai_asset: response.data.ai_asset || [],
              app_key: response.data.app_key || '',
              app_secret: response.data.app_secret || ''
            }
          } else {
            this.$message.error('获取账户详情失败: ' + response.msg)
            // 降级方案：使用列表数据，确保状态字段为字符串
            this.accountForm = { 
              ...row,
              status: String(row.status || '1')
            }
          }
        })
        .catch(error => {
          console.error('获取账户详情失败:', error)
          this.$message.error('获取账户详情失败: 网络错误')
          // 降级方案：使用列表数据，确保状态字段为字符串
          this.accountForm = { 
            ...row,
            status: String(row.status || '1')
          }
        })
        .finally(() => {
          this.accountsLoading = false
          this.showAccountDialog = true
        })
    },
    deleteAccount(row) {
      this.$confirm(`确定要删除账户 ${row.user_name} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userService.deleteUser(row.id)
          .then(response => {
            if (response.error_code === 0) {
              this.$message.success('删除成功')
              this.fetchUsers()
            } else {
              this.$message.error('删除失败: ' + response.msg)
            }
          })
          .catch(error => {
            console.error('删除用户失败:', error)
            this.$message.error('删除失败: 网络错误')
          })
      }).catch(() => {
        // 取消删除
      })
    },
    saveAccount() {
      if (!this.accountForm.user_name) {
        this.$message.error('请输入用户名')
        return
      }
      
      if (this.isEditAccount) {
        userService.updateUser(this.accountForm.id, this.accountForm)
          .then(response => {
            if (response.error_code === 0) {
              this.$message.success('编辑成功')
              this.fetchUsers()
            } else {
              this.$message.error('编辑失败: ' + response.msg)
            }
          })
          .catch(error => {
            console.error('编辑用户失败:', error)
            this.$message.error('编辑失败: 网络错误')
          })
      } else {
        userService.createUser(this.accountForm)
          .then(response => {
            if (response.error_code === 0) {
              this.$message.success('添加成功')
              this.fetchUsers()
            } else {
              this.$message.error('添加失败: ' + response.msg)
            }
          })
          .catch(error => {
            console.error('添加用户失败:', error)
            this.$message.error('添加失败: 网络错误')
          })
      }
      
      this.showAccountDialog = false
      this.isEditAccount = false
      this.accountForm = {
        user_name: '',
        status: '1',
        balance: 0,
        ai_asset: [],
        app_key: '',
        app_secret: ''
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

.accounts-page {
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
