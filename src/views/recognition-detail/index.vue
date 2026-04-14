<template>
  <div class="rec-detail">
    <div class="topbar">
      <div class="topbar-left">
        <el-button class="back-btn" size="small" icon="el-icon-arrow-left" @click="goBack">返回</el-button>
        <div class="title-wrap">
          <div class="kicker">识别详情</div>
          <div class="title-row">
            <div class="title">{{ headerTitle }}</div>
            <el-tag v-if="statusTag" class="status" size="mini" :type="statusTag.type">{{ statusTag.text }}</el-tag>
          </div>
        </div>
      </div>
      <div class="topbar-right">
        <el-button size="small" icon="el-icon-refresh" :loading="loading" @click="reload">刷新</el-button>
        <el-button size="small" icon="el-icon-link" :disabled="!imageUrl" @click="copyImageUrl">复制原图链接</el-button>
        <el-button size="small" type="primary" icon="el-icon-view" :disabled="!imageUrl" @click="openImage">打开原图</el-button>
      </div>
    </div>

    <el-skeleton v-if="loading" animated :rows="10" />

    <div v-else>
      <el-result
        v-if="error"
        icon="error"
        title="加载失败"
        :sub-title="error"
      >
        <template slot="extra">
          <el-button type="primary" @click="reload">重试</el-button>
        </template>
      </el-result>

      <div v-else-if="detail" class="content">
        <div class="hero">
          <div class="media">
            <el-image
              class="hero-image"
              :src="thumbnailUrl || imageUrl"
              :preview-src-list="imageUrl ? [imageUrl] : []"
              fit="cover"
            />
          </div>

          <div class="meta">
            <div class="meta-card">
              <div class="meta-head">
                <div class="meta-title">任务信息</div>
                <div class="meta-sub" v-if="detail.user_id">用户：{{ detail.user_id }}</div>
              </div>

              <div class="kv">
                <div class="kv-item">
                  <div class="k">识别模式</div>
                  <div class="v">{{ algorithmTypeLabel }}</div>
                </div>
                <div class="kv-item">
                  <div class="k">记录ID</div>
                  <div class="v mono">{{ detail.id }}</div>
                </div>
                <div class="kv-item">
                  <div class="k">创建时间</div>
                  <div class="v">{{ detail.create_time || '-' }}</div>
                </div>
                <div class="kv-item">
                  <div class="k">费用合计</div>
                  <div class="v price">¥ {{ displayCostTotal.toFixed(2) }}</div>
                </div>
              </div>

              <div class="alg">
                <div class="alg-title">使用算法</div>
                <div class="alg-tags" v-if="detectAlgIds.length">
                  <el-tag
                    v-for="(item, idx) in detectAlgIds"
                    :key="item.id || idx"
                    class="alg-tag"
                    size="mini"
                    effect="plain"
                  >
                    {{ algName(item) }}
                    <span v-if="algPrice(item) != null"> · ¥{{ Number(algPrice(item)).toFixed(2) }}</span>
                  </el-tag>
                </div>
                <div v-else class="muted">未绑定算法</div>
              </div>

              <div class="cost">
                <div class="cost-title">金额信息</div>
                <div class="cost-tags" v-if="consumptionRecords.length">
                  <el-tag size="mini" effect="plain" class="cost-tag">预扣 ¥{{ consumptionPre.toFixed(2) }}</el-tag>
                  <el-tag size="mini" effect="plain" class="cost-tag">扣费 ¥{{ consumptionDown.toFixed(2) }}</el-tag>
                  <el-tag size="mini" effect="plain" class="cost-tag">返还 ¥{{ consumptionBack.toFixed(2) }}</el-tag>
                </div>
                <div v-else class="muted">暂无金额记录</div>
              </div>
            </div>
          </div>
        </div>

        <div class="lower">
          <div class="panel">
            <div class="panel-head">
              <div class="panel-title">识别流程</div>
              <div class="panel-sub">基于后端 nodes / consumption 展示</div>
            </div>
            <el-timeline class="timeline">
              <el-timeline-item
                v-for="(t, idx) in timelineItems"
                :key="idx"
                :timestamp="t.time || '-'"
                placement="top"
                :type="t.type"
                :icon="t.icon"
              >
                <div class="tl-title">{{ t.title }}</div>
                <div class="tl-desc" v-if="t.desc">{{ t.desc }}</div>
                <div class="tl-amount" v-if="t.amount != null">
                  ¥ {{ Number(t.amount).toFixed(2) }}
                  <span class="tl-amount-note" v-if="t.amountNote">{{ t.amountNote }}</span>
                </div>
              </el-timeline-item>
            </el-timeline>
            <div class="muted" v-if="timelineItems.length === 0">暂无流程数据</div>
          </div>

          <div class="panel">
            <div class="panel-head">
              <div class="panel-title">识别结果</div>
              <div class="panel-sub">原始结果 JSON 与摘要</div>
            </div>

            <div class="summary" v-if="resultSummary">
              <div class="sum-item">
                <div class="sum-k">标签</div>
                <div class="sum-v">{{ resultSummary.label }}</div>
              </div>
              <div class="sum-item">
                <div class="sum-k">置信度</div>
                <div class="sum-v">{{ resultSummary.confidence != null ? (resultSummary.confidence + '%') : '-' }}</div>
              </div>
              <div class="sum-item">
                <div class="sum-k">状态</div>
                <div class="sum-v">{{ statusTag ? statusTag.text : '-' }}</div>
              </div>
            </div>

            <div class="json-wrap">
              <pre class="json">{{ prettyResult }}</pre>
            </div>
            <div class="result-actions">
              <el-button size="small" icon="el-icon-document-copy" @click="copyJson">复制JSON</el-button>
              <el-button size="small" icon="el-icon-download" :disabled="!imageUrl" @click="downloadImage">下载原图</el-button>
              <!-- <el-button size="small" type="primary" icon="el-icon-document" @click="$router.push('/settings')">接入文档</el-button> -->
            </div>
          </div>
        </div>
      </div>

      <el-empty v-else description="暂无数据" />
    </div>
  </div>
</template>

<script>
import recognitionService from '@/services/recognition.service'
import service from '@/services/api'

export default {
  name: 'RecognitionDetail',
  data() {
    return {
      loading: false,
      error: '',
      detail: null,
      rulesById: {}
    }
  },
  computed: {
    recognitionId() {
      return this.$route.params.id
    },
    imageUrl() {
      return this.detail?.image_url || ''
    },
    thumbnailUrl() {
      return this.detail?.thumbnail_url || ''
    },
    detectAlgIds() {
      const ids = this.detail?.detect_alg
      return Array.isArray(ids) ? ids : []
    },
    algorithmTypeLabel() {
      const t = this.detail?.algorithm_type
      if (t === 'accurate') return '高精度模式'
      if (t === 'standard') return '标准模式'
      return t || '-'
    },
    headerTitle() {
      const no = this.detail?.image_no
      if (no) return no
      return this.recognitionId
    },
    totalPrice() {
      return this.detectAlgIds.reduce((sum, item) => {
        const p = this.algPrice(item)
        return sum + (typeof p === 'number' ? p : 0)
      }, 0)
    },
    nodes() {
      const ns = this.detail?.nodes
      return Array.isArray(ns) ? ns : []
    },
    consumption() {
      const c = this.detail?.consumption
      return c && typeof c === 'object' ? c : {}
    },
    consumptionRecords() {
      const rs = this.consumption?.records
      return Array.isArray(rs) ? rs : []
    },
    consumptionPre() {
      const v = Number(this.consumption?.pre)
      return Number.isFinite(v) ? v : 0
    },
    consumptionDown() {
      const v = Number(this.consumption?.down)
      return Number.isFinite(v) ? v : 0
    },
    consumptionBack() {
      const v = Number(this.consumption?.back)
      return Number.isFinite(v) ? v : 0
    },
    consumptionTotal() {
      const v = Number(this.consumption?.total)
      return Number.isFinite(v) ? v : 0
    },
    displayCostTotal() {
      if (this.consumptionRecords.length) return this.consumptionTotal
      return this.totalPrice
    },
    parsedResult() {
      const r = this.detail?.recognition_result
      if (!r) return null
      if (typeof r === 'string') {
        try {
          return JSON.parse(r)
        } catch (e) {
          return { raw: r }
        }
      }
      if (typeof r === 'object') return r
      return { value: r }
    },
    prettyResult() {
      const r = this.parsedResult
      if (!r) return '{}'
      try {
        return JSON.stringify(r, null, 2)
      } catch (e) {
        return String(r)
      }
    },
    resultSummary() {
      const r = this.parsedResult
      if (!r || typeof r !== 'object') return null
      const label = r.label || r.name || r.title
      const confidence = (r.confidence != null) ? Number(r.confidence) : null
      if (!label && confidence == null) return null
      return { label: label || '-', confidence: Number.isFinite(confidence) ? confidence : null }
    },
    statusCode() {
      const s = this.detail?.status
      if (s) return String(s)
      const lastNode = this.nodes.length ? this.nodes[this.nodes.length - 1] : null
      return lastNode?.node_type ? String(lastNode.node_type) : ''
    },
    statusTag() {
      const s = this.statusCode
      if (s === 'waiting') return { type: 'info', text: '待识别' }
      if (s === 'processing') return { type: 'warning', text: '识别中' }
      if (s === 'success') return { type: 'success', text: '已完成' }
      if (s === 'fail') return { type: 'danger', text: '失败' }
      if (s === 'output') return { type: 'success', text: '已输出' }
      const r = this.parsedResult
      const hasResult = !!(r && typeof r === 'object' && Object.keys(r).length)
      if (hasResult) return { type: 'success', text: '已完成' }
      return { type: 'info', text: '未知' }
    },
    statusHint() {
      if (!this.statusTag) return ''
      if (this.statusCode === 'fail') return '识别失败，可查看节点信息或稍后重试'
      if (this.statusCode === 'success' || this.statusCode === 'output') return '识别结果已写入，可查看摘要与原始 JSON'
      if (this.statusCode === 'processing') return '识别任务正在处理，稍后刷新查看结果'
      if (this.statusCode === 'waiting') return '任务已创建，等待进入识别队列'
      return '请刷新查看最新状态'
    },
    timelineItems() {
      const nodeMap = {
        waiting: { title: '待识别', type: 'info', icon: 'el-icon-more' },
        processing: { title: '识别中', type: 'warning', icon: 'el-icon-loading' },
        success: { title: '识别完成', type: 'success', icon: 'el-icon-circle-check' },
        fail: { title: '识别失败', type: 'danger', icon: 'el-icon-circle-close' },
        output: { title: '成果已输出', type: 'success', icon: 'el-icon-finished' }
      }

      const nodes = this.nodes.map(n => {
        const t = (n?.node_type || '').toString()
        const meta = nodeMap[t] || { title: t || '未知节点', type: 'info', icon: 'el-icon-more' }
        const info = n?.node_info && typeof n.node_info === 'object' ? n.node_info : {}
        const rawAmount = info.amount ?? info.cost ?? info.fee ?? info.money
        const amount = rawAmount != null && Number.isFinite(Number(rawAmount)) ? Number(rawAmount) : null
        const desc = n?.node_info ? (info.msg || info.message || '') : ''
        return {
          kind: 'node',
          time: n?.create_time || '',
          type: meta.type,
          icon: meta.icon,
          title: meta.title,
          desc: desc || '',
          amount,
          amountNote: amount != null ? '节点金额' : ''
        }
      })

      const moneyTitles = { pre: '预扣费', down: '扣费', back: '返还' }
      const moneyTypes = { pre: 'warning', down: 'success', back: 'info' }

      const money = this.consumptionRecords.map(r => {
        const st = (r?.status || '').toString()
        return {
          kind: 'money',
          time: r?.create_time || '',
          type: moneyTypes[st] || 'info',
          icon: 'el-icon-coin',
          title: moneyTitles[st] || '费用变更',
          desc: r?.description || '',
          amount: r?.amount != null ? Number(r.amount) : null,
          amountNote: st ? st : ''
        }
      })

      const items = [...nodes, ...money].filter(it => it.time || it.title)
      items.sort((a, b) => (a.time || '').localeCompare(b.time || ''))
      return items
    }
  },
  watch: {
    recognitionId: {
      immediate: true,
      handler() {
        this.reload()
      }
    }
  },
  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.back()
      } else {
        this.$router.push('/upload')
      }
    },
    async reload() {
      this.error = ''
      this.loading = true
      try {
        await Promise.all([this.fetchDetail(), this.fetchRules()])
      } finally {
        this.loading = false
      }
    },
    async fetchDetail() {
      try {
        const res = await recognitionService.getRecognitionDetail(this.recognitionId)
        if (res?.error_code === 0) {
          this.detail = res.data
          return
        }
        this.detail = null
        this.error = res?.msg || '加载失败'
      } catch (e) {
        this.detail = null
        this.error = e?.message || '网络错误'
      }
    },
    async fetchRules() {
      try {
        const res = await service.get('/v1/detect/all_rules')
        if (res?.error_code !== 0) return
        const items = Array.isArray(res.data) ? res.data : []
        const map = {}
        items.forEach(it => {
          if (it && it.id) map[it.id] = it
        })
        this.rulesById = map
      } catch (e) {
        void e
      }
    },
    algName(item) {
      if (typeof item === 'object' && item !== null) {
        return item.name || item.ai_name || item.id || '未知算法'
      }
      const rule = this.rulesById?.[item]
      return rule?.ai_name || item
    },
    algPrice(item) {
      if (typeof item === 'object' && item !== null) {
        const p = Number(item.price)
        return Number.isFinite(p) ? p : null
      }
      const rule = this.rulesById?.[item]
      if (!rule) return null
      const p = Number(rule.price)
      return Number.isFinite(p) ? p : null
    },
    openImage() {
      if (!this.imageUrl) return
      window.open(this.imageUrl, '_blank')
    },
    downloadImage() {
      const url = this.imageUrl || this.thumbnailUrl
      if (!url) return
      
      this.$message.info('正在准备下载原图...')
      
      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok')
          return response.blob()
        })
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = blobUrl
          link.download = `recognition_${this.detail.id || 'image'}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(blobUrl)
          this.$message.success('下载成功')
        })
        .catch(error => {
          console.error('下载图片失败:', error)
          this.$message.error('下载失败，请尝试右键另存为')
          // 降级方案：直接打开
          window.open(url, '_blank')
        })
    },
    async copyImageUrl() {
      const url = this.imageUrl
      if (!url) return
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url)
          this.$message.success('已复制')
          return
        }
      } catch (e) {
        void e
      }
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      this.$message.success('已复制')
    },
    async copyJson() {
      try {
        const text = this.prettyResult
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text)
          this.$message.success('已复制JSON')
          return
        }
      } catch (e) {
        void e
      }
      const ta = document.createElement('textarea')
      ta.value = this.prettyResult
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      this.$message.success('已复制JSON')
    }
  }
}
</script>

<style scoped>
.rec-detail {
  --ink: #0f172a;
  --muted: rgba(15, 23, 42, 0.62);
  --wash: rgba(15, 23, 42, 0.06);
  --soft: rgba(15, 23, 42, 0.12);
  --glow: rgba(24, 144, 255, 0.22);
  height: 100%;
  box-sizing: border-box;
  padding: 14px 14px 18px;
  overflow: auto;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background:
    radial-gradient(800px 200px at 10% -40%, rgba(24, 144, 255, 0.22), transparent 55%),
    radial-gradient(500px 160px at 90% -30%, rgba(67, 233, 123, 0.20), transparent 55%),
    rgba(255, 255, 255, 0.92);
  border: 1px solid var(--color-border);
  backdrop-filter: blur(10px);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.back-btn {
  border-radius: 10px;
}

.title-wrap {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.kicker {
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.title {
  font-size: 18px;
  font-weight: 800;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status {
  border-radius: 999px;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.content {
  margin-top: 12px;
  display: grid;
  gap: 12px;
}

.hero {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 12px;
  align-items: start;
}

.media {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: #fff;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.hero-image {
  width: 100%;
  height: 360px;
  display: block;
  background:
    radial-gradient(320px 180px at 50% 20%, rgba(24, 144, 255, 0.10), transparent 60%),
    rgba(15, 23, 42, 0.02);
}

.meta {
  min-width: 0;
}

.meta-card {
  border-radius: 16px;
  border: 1px solid var(--color-border);
  background:
    radial-gradient(900px 280px at 40% -40%, rgba(24, 144, 255, 0.18), transparent 60%),
    radial-gradient(500px 220px at 110% 10%, rgba(245, 87, 108, 0.10), transparent 60%),
    #ffffff;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  padding: 14px 14px 16px;
  display: grid;
  gap: 14px;
  box-sizing: border-box;
}

.meta-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.meta-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--ink);
}

.meta-sub {
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 55%;
}

.kv {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.kv-item {
  padding: 10px 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid var(--soft);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.k {
  font-size: 12px;
  color: var(--muted);
}

.v {
  margin-top: 6px;
  font-size: 14px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.90);
  word-break: break-all;
}

.v.price {
  color: #0f766e;
  text-shadow: 0 10px 24px rgba(16, 185, 129, 0.22);
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  font-weight: 600;
}

.alg {
  display: grid;
  gap: 10px;
}

.alg-title {
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.alg-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.alg-tag {
  border-radius: 999px;
}

.cost {
  display: grid;
  gap: 10px;
}

.cost-title {
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.cost-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cost-tag {
  border-radius: 999px;
}

.muted {
  color: var(--muted);
  font-size: 13px;
}

.lower {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 12px;
  align-items: start;
}

.panel {
  border-radius: 16px;
  border: 1px solid var(--color-border);
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  padding: 14px;
  box-sizing: border-box;
  min-width: 0;
}

.panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 10px;
}

.panel-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--ink);
}

.panel-sub {
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 55%;
}

.timeline {
  padding: 4px 2px 2px;
}

.tl-title {
  font-size: 13px;
  font-weight: 800;
  color: rgba(15, 23, 42, 0.92);
}

.tl-desc {
  margin-top: 6px;
  color: rgba(15, 23, 42, 0.66);
  font-size: 12px;
  line-height: 1.6;
}

.tl-amount {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--wash);
  border: 1px solid var(--soft);
  font-size: 12px;
  font-weight: 800;
  color: rgba(15, 23, 42, 0.90);
}

.tl-amount-note {
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
}

.summary {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.sum-item {
  padding: 10px 10px 12px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.03);
  border: 1px solid rgba(15, 23, 42, 0.10);
}

.sum-k {
  font-size: 12px;
  color: var(--muted);
}

.sum-v {
  margin-top: 6px;
  font-size: 14px;
  font-weight: 800;
  color: rgba(15, 23, 42, 0.92);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.json-wrap {
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.10);
  background:
    radial-gradient(500px 180px at 10% 0%, rgba(24, 144, 255, 0.08), transparent 60%),
    rgba(15, 23, 42, 0.02);
  overflow: hidden;
}

.json {
  margin: 0;
  padding: 12px 12px 14px;
  font-size: 12px;
  line-height: 1.7;
  color: rgba(15, 23, 42, 0.86);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  max-height: 360px;
  overflow: auto;
}

.result-actions {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}

@media screen and (max-width: 1200px) {
  .hero {
    grid-template-columns: 1fr;
  }
  .hero-image {
    height: 320px;
  }
  .lower {
    grid-template-columns: 1fr;
  }
}
</style>
