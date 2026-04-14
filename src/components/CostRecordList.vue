<template>
  <div class="cost-record-list">
    <div class="head">
      <div class="head-left">
        <div class="title">消耗流水</div>
        <div class="sub">展示预扣/扣费/返还三类记录</div>
      </div>
      <div class="head-right">
        <el-button size="small" icon="el-icon-refresh" :loading="loading" @click="fetchData">刷新</el-button>
      </div>
    </div>

    <div class="stats">
      <div class="stat-card a">
        <div class="stat-k">当前余额</div>
        <div class="stat-v">¥ {{ formatAmount(balance) }}</div>
        <div class="stat-hint">以服务端余额接口为准</div>
      </div>
      <div class="stat-card b">
        <div class="stat-k">预扣金额</div>
        <div class="stat-v">¥ {{ formatAmount(summary.pre_amount) }}</div>
        <div class="stat-hint">识别创建时预扣除</div>
      </div>
      <div class="stat-card c">
        <div class="stat-k">已扣金额</div>
        <div class="stat-v">¥ {{ formatAmount(summary.down_amount) }}</div>
        <div class="stat-hint">识别成功/输出后转为扣费</div>
      </div>
    </div>

    <div class="filters">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        size="small"
        style="width: 260px;"
      />
      <el-input
        v-model="keyword"
        placeholder="搜索图片编号 / 备注"
        size="small"
        clearable
        prefix-icon="el-icon-search"
        style="width: 260px;"
        @keyup.enter.native="onSearch"
      />
      <el-button size="small" type="primary" icon="el-icon-search" @click="onSearch">查询</el-button>
      <el-button size="small" @click="onReset">重置</el-button>
    </div>

    <el-table :data="rows" style="width: 100%" v-loading="loading" row-key="id">
      <el-table-column label="图片" width="86" align="center">
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.recognition && (scope.row.recognition.thumbnail_url || scope.row.recognition.image_url)"
            :src="scope.row.recognition.thumbnail_url || scope.row.recognition.image_url"
            :preview-src-list="scope.row.recognition.image_url ? [scope.row.recognition.image_url] : []"
            class="thumb"
            fit="cover"
          />
          <div v-else class="thumb ph">-</div>
        </template>
      </el-table-column>

      <el-table-column label="图片编号" min-width="180">
        <template slot-scope="scope">
          <div class="mono">{{ scope.row.recognition?.image_no || scope.row.recognition_id }}</div>
          <div class="muted tiny">{{ scope.row.recognition_id }}</div>
        </template>
      </el-table-column>

      <el-table-column label="模式" width="110">
        <template slot-scope="scope">
          <el-tag size="mini" effect="plain">{{ modeLabel(scope.row.recognition?.algorithm_type) }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="金额" width="140" align="right">
        <template slot-scope="scope">
          <span class="amount" :class="amountClass(scope.row.status)">
            {{ amountPrefix(scope.row.status) }}¥ {{ formatAmount(scope.row.amount) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="110" align="center">
        <template slot-scope="scope">
          <el-tag size="mini" :type="statusTagType(scope.row.status)">{{ statusText(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="description" label="说明" min-width="200" show-overflow-tooltip />
      <el-table-column prop="create_time" label="时间" width="170" />

      <el-table-column label="操作" width="110" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="goRecognition(scope.row.recognition_id)">识别详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
      />
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'CostRecordList',
  data() {
    return {
      loading: false,
      balance: 0,
      summary: { pre_amount: 0, down_amount: 0, count: 0 },
      dateRange: null,
      keyword: '',
      rows: [],
      pagination: {
        page: 1,
        size: 20,
        total: 0
      }
    }
  },
  mounted() {
    this.fetchBalance()
    this.fetchData()
  },
  methods: {
    formatAmount(amount) {
      const v = Number(amount || 0)
      return Number.isFinite(v) ? v.toFixed(2) : '0.00'
    },
    modeLabel(mode) {
      if (mode === 'accurate') return '高精度'
      if (mode === 'standard') return '标准'
      return mode || '-'
    },
    statusText(status) {
      if (status === 'pre') return '预扣'
      if (status === 'down') return '扣费'
      if (status === 'back') return '返还'
      return status || '-'
    },
    statusTagType(status) {
      if (status === 'pre') return 'warning'
      if (status === 'down') return 'success'
      if (status === 'back') return 'info'
      return 'info'
    },
    amountPrefix(status) {
      if (status === 'back') return '+'
      if (status === 'pre' || status === 'down') return '-'
      return ''
    },
    amountClass(status) {
      if (status === 'back') return 'pos'
      if (status === 'pre' || status === 'down') return 'neg'
      return ''
    },
    formatDate(d) {
      if (!d) return ''
      const dt = new Date(d)
      const y = dt.getFullYear()
      const m = String(dt.getMonth() + 1).padStart(2, '0')
      const day = String(dt.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    },
    async fetchBalance() {
      try {
        const res = await api.get('/v1/consumption/balance')
        if (res?.error_code === 0) {
          this.balance = Number(res.data?.balance || 0)
        }
      } catch (e) {
        void e
      }
    },
    async fetchData() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          size: this.pagination.size,
          search: this.keyword || undefined
        }
        if (this.dateRange && this.dateRange.length === 2) {
          params.start_time = this.formatDate(this.dateRange[0])
          params.end_time = this.formatDate(this.dateRange[1])
        }
        const res = await api.get('/v1/consumption/deduct_list', { params })
        if (res?.error_code === 0) {
          this.rows = Array.isArray(res.data?.list) ? res.data.list : []
          this.pagination.total = Number(res.data?.total || 0)
          const s = res.data?.summary || {}
          this.summary = {
            pre_amount: Number(s.pre_amount || 0),
            down_amount: Number(s.down_amount || 0),
            count: Number(s.count || 0)
          }
          return
        }
        this.rows = []
        this.pagination.total = 0
        this.summary = { pre_amount: 0, down_amount: 0, count: 0 }
      } catch (e) {
        this.rows = []
        this.pagination.total = 0
        this.summary = { pre_amount: 0, down_amount: 0, count: 0 }
      } finally {
        this.loading = false
      }
    },
    onSearch() {
      this.pagination.page = 1
      this.fetchData()
    },
    onReset() {
      this.dateRange = null
      this.keyword = ''
      this.pagination.page = 1
      this.fetchData()
    },
    handleSizeChange(size) {
      this.pagination.size = size
      this.pagination.page = 1
      this.fetchData()
    },
    handleCurrentChange(page) {
      this.pagination.page = page
      this.fetchData()
    },
    goRecognition(id) {
      if (!id) return
      this.$router.push(`/recognition/${id}`)
    }
  }
}
</script>

<style scoped>
.cost-record-list {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  padding: 16px;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.title {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
}

.sub {
  margin-top: 2px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin: 10px 0 12px;
}

.stat-card {
  border-radius: 14px;
  padding: 12px 12px 14px;
  border: 1px solid var(--color-border);
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.stat-card.a {
  background: radial-gradient(600px 160px at 20% -20%, rgba(24, 144, 255, 0.22), transparent 60%), #fff;
}
.stat-card.b {
  background: radial-gradient(600px 160px at 20% -20%, rgba(245, 87, 108, 0.14), transparent 60%), #fff;
}
.stat-card.c {
  background: radial-gradient(600px 160px at 20% -20%, rgba(67, 233, 123, 0.18), transparent 60%), #fff;
}
.stat-card.d {
  background: radial-gradient(600px 160px at 20% -20%, rgba(49, 130, 206, 0.16), transparent 60%), #fff;
}
.stat-card.e {
  background: radial-gradient(600px 160px at 20% -20%, rgba(217, 119, 6, 0.14), transparent 60%), #fff;
}

.stat-k {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.stat-v {
  margin-top: 6px;
  font-size: 20px;
  font-weight: 900;
  color: var(--color-text);
}
.stat-hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  margin-bottom: 12px;
}

.thumb {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: #fff;
}

.thumb.ph {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-weight: 700;
  color: var(--color-text);
}

.muted {
  color: var(--color-text-secondary);
}

.muted.tiny {
  font-size: 12px;
  margin-top: 4px;
}

.amount {
  font-weight: 900;
  color: #e53e3e;
}
.amount.pos {
  color: #0f766e;
}
.amount.neg {
  color: #e53e3e;
}

.pager {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

@media screen and (max-width: 1200px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
