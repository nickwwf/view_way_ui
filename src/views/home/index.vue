<template>
  <div class="home-container">

    <!-- 主内容区 -->
    <div class="home-main">
      <!-- 内容区域 -->
      <div class="content-area">
        <!-- 首页仪表盘 -->
        <div class="dashboard">
          <!-- 欢迎横幅 -->
          <div class="welcome-banner" v-if="false">
            <div class="welcome-content">
              <h1>欢迎使用算法管理平台</h1>
              <p>您可以在这里轻松管理算法模型、监控任务进度以及分析识别结果。</p>
            </div>
            <div class="welcome-stats">
              <div class="stat-item">
                <div class="stat-value">24</div>
                <div class="stat-label">今日任务</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">99.8%</div>
                <div class="stat-label">识别准确率</div>
              </div>
              <div class="metrics-cards">
                <div class="metric-card">
                  <div class="metric-title">今日成功率</div>
                  <div class="metric-value">{{ successRateToday }}%</div>
                  <div class="metric-foot">
                    <i class="el-icon-s-claim"></i>
                    <span>识别成功比</span>
                  </div>
                </div>
                <div class="metric-card">
                  <div class="metric-title">平均耗时</div>
                  <div class="metric-value">{{ avgLatencyMsToday }}ms</div>
                  <div class="metric-foot">
                    <i class="el-icon-timer"></i>
                    <span>单图处理</span>
                  </div>
                </div>
                <div class="metric-card">
                  <div class="metric-title">平均单价</div>
                  <div class="metric-value">¥ {{ formatAmount(avgUnitPriceToday) }}</div>
                  <div class="metric-foot">
                    <i class="el-icon-price-tag"></i>
                    <span>今日均价</span>
                  </div>
                </div>
                <div class="metric-card">
                  <div class="metric-title">进行中任务</div>
                  <div class="metric-value">{{ pendingTasks }}</div>
                  <div class="metric-foot">
                    <i class="el-icon-loading"></i>
                    <span>队列中</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 图片识别任务趋势图 -->
          <div class="panel trend-panel full">
            <div class="panel-header">
              <h3>图片识别任务趋势（近7日）</h3>
              <el-button size="mini" icon="el-icon-refresh" :loading="loading" @click="fetchDashboard">刷新</el-button>
            </div>
            <div class="bars">
              <div 
                v-for="(d, i) in trendData" 
                :key="'t-'+i" 
                class="bar"
              >
                <div class="bar-fill" :style="{ height: (d.tasksPercent || 0) + '%' }" :title="`${d.day}：${d.tasks} 单`"></div>
                <div class="bar-label">{{ d.day }}</div>
              </div>
            </div>
          </div>
          <div class="info-grid">
            <div class="panel alg-rank">
              <div class="panel-header">
                <h3>算法使用排行（Top 5）</h3>
              </div>
              <div class="rank-list">
                <div class="rank-item" v-for="(alg, idx) in algorithmUsage" :key="alg.name">
                  <div class="rank-row">
                    <span class="rank-name">{{ idx + 1 }}. {{ alg.name }}</span>
                    <span class="rank-count">{{ alg.count }}</span>
                  </div>
                  <div class="rank-bar">
                    <div class="rank-fill" :style="{ width: alg.percent + '%' }"></div>
                  </div>
                </div>
                <div v-if="algorithmUsage.length === 0" class="empty-hint">暂无数据</div>
              </div>
            </div>
            <div class="panel recent-tasks">
              <div class="panel-header">
                <h3>今日识别明细</h3>
              </div>
              <el-table :data="recentTasks" size="small" border>
                <el-table-column prop="time" label="时间" width="120" />
                <el-table-column prop="algorithm" label="算法" />
                <el-table-column prop="images" label="图片数" width="80" align="center" />
                <el-table-column prop="latency" label="耗时(ms)" width="100" align="right" />
                <el-table-column prop="status" label="状态" width="100">
                  <template slot-scope="scope">
                    <el-tag :type="scope.row.status==='成功'?'success':(scope.row.status==='进行中'?'warning':'danger')">
                      {{ scope.row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="cost" label="费用" width="100" align="right">
                  <template slot-scope="scope">¥ {{ formatAmount(scope.row.cost) }}</template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </div>
    </div>

    
  </div>
</template>

<script>
import recognitionService from '@/services/recognition.service'

export default {
  name: 'Home',
  data() {
    return {
      loading: false,
      successRateToday: 0,
      avgLatencyMsToday: 0,
      avgUnitPriceToday: 0,
      pendingTasks: 0,
      trendData: [],
      algorithmUsage: [],
      recentTasks: []
    }
  },
  mounted() {
    this.fetchDashboard()
  },
  methods: {
    async fetchDashboard() {
      this.loading = true
      try {
        const res = await recognitionService.getDashboard()
        if (res?.error_code !== 0) {
          this.$message.error(res?.msg || '加载首页数据失败')
          return
        }
        const trend = Array.isArray(res.data?.trend) ? res.data.trend : []
        const maxTasks = trend.reduce((m, it) => Math.max(m, Number(it.tasks || 0)), 0)
        this.trendData = trend.map(it => ({
          day: it.day,
          tasks: Number(it.tasks || 0),
          cost: Number(it.cost || 0),
          tasksPercent: maxTasks ? Math.round((Number(it.tasks || 0) / maxTasks) * 100) : 0
        }))
        this.algorithmUsage = Array.isArray(res.data?.algorithm_usage) ? res.data.algorithm_usage : []
        this.recentTasks = Array.isArray(res.data?.today_tasks) ? res.data.today_tasks : []
      } catch (e) {
        this.$message.error(e?.message || '网络错误')
      } finally {
        this.loading = false
      }
    },
    formatAmount(amount) {
      return Number(amount || 0).toFixed(2)
    },
    
  }
}
</script>

<style scoped>
.home-container {
  width: 100%;
  background-color: var(--color-page-bg);
}

.dashboard {
  display: grid;
  gap: 16px;
}

/* 欢迎横幅 */
.welcome-banner {
  background: linear-gradient(135deg, var(--color-primary) 0%, #36cfc9 100%);
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(24, 144, 255, 0.2);
}

.welcome-content h1 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 12px 0;
  letter-spacing: 0.5px;
}

.welcome-content p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  max-width: 480px;
  line-height: 1.6;
}

.welcome-stats {
  display: flex;
  gap: 40px;
  padding: 0 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 主内容区 */
.home-main {
  display: block;
}

/* 内容区域 */
.content-area {
  padding: 8px 0 0 0;
}

/* 分栏布局：左KPI + 右快捷操作 */
.layout-grid {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 16px;
  align-items: start;
  margin-bottom: 16px;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

/* 快捷入口 */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.quick-actions.vertical {
  grid-template-columns: 1fr;
}

.kpi-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 16px 0 20px;
}
.kpi-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 16px;
}
.kpi-title {
  font-size: 13px;
  color: var(--color-text-secondary);
}
.kpi-value {
  font-size: 24px;
  font-weight: 700;
  margin: 6px 0 8px;
}
.kpi-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.metrics-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 0 0 20px;
}
.metric-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 16px;
}
.metric-title {
  font-size: 13px;
  color: var(--color-text-secondary);
}
.metric-value {
  font-size: 22px;
  font-weight: 700;
  margin: 6px 0 8px;
}
.metric-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.action-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.action-icon.upload {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.action-icon.history {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.action-icon.cost {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.action-icon.api {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.action-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 13px;
  color: #999;
}

/* 紧凑信息区布局 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}
.panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 16px;
}
.panel.full {
  grid-column: 1 / -1;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}
.thumb-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}
.thumb {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 8px;
  cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease;
}
.thumb:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.thumb-image {
  width: 100%;
  height: 70px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  margin-bottom: 6px;
}
.thumb-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.thumb-cost {
  color: #e53e3e;
  font-weight: 600;
  font-size: 12px;
}
.empty-hint {
  color: var(--color-text-secondary);
}

.alg-list {
  display: grid;
  gap: 8px;
}
.alg-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
.alg-name {
  font-weight: 600;
}
.alg-actions {
  display: flex;
  gap: 8px;
}

.trend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.trend-title {
  font-weight: 600;
  margin-bottom: 6px;
}
.bars {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  align-items: end;
  height: 120px;
}
.bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.bar-fill {
  width: 100%;
  background: #a9c4ff;
  border-radius: 6px 6px 0 0;
  transition: height .3s ease;
}
.bar-fill.cost {
  background: #ffd29e;
}
.bar-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.info-grid {
  display: grid;
  grid-template-columns: 1.5fr 2fr;
  gap: 16px;
}
.rank-list {
  display: grid;
  gap: 12px;
}
.rank-item {
  display: grid;
  gap: 8px;
}
.rank-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}
.rank-bar {
  width: 100%;
  height: 8px;
  background: var(--color-surface-2);
  border-radius: 6px;
  overflow: hidden;
}
.rank-fill {
  height: 100%;
  background: linear-gradient(90deg, #84fab0 0%, #8fd3f4 100%);
}

/* 设置页面 */
.settings-content {
  max-width: 800px;
}

.settings-card {
  margin-bottom: 20px;
}

.api-key-item {
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
}

.api-key-item:last-child {
  border-bottom: none;
}

.key-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.key-value {
  display: flex;
  align-items: center;
  gap: 12px;
}

.key-value code {
  background: #f5f7fa;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
  color: #333;
}

.api-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

/* 上传弹窗 */
.upload-area {
  text-align: center;
}

.upload-area :deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
}

.upload-options {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.option-item:last-child {
  margin-bottom: 0;
}

.option-item .label {
  width: 100px;
  color: #666;
}

/* 响应式 */
@media screen and (max-width: 1200px) {
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
  .kpi-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .metrics-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .layout-grid {
    grid-template-columns: 1fr;
  }
  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media screen and (max-width: 768px) {
  .quick-actions {
    grid-template-columns: 1fr;
  }
  .kpi-cards {
    grid-template-columns: 1fr;
  }
  .metrics-cards {
    grid-template-columns: 1fr;
  }
  .layout-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
