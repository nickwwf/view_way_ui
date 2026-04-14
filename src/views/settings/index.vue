<template>
  <div class="settings-wrapper">
    <el-card class="page-card">
      <div class="page-head">
        <div class="title">
          <div class="title-main">系统设置</div>
          <div class="title-sub">接入文档与回调配置</div>
        </div>
        <div class="actions">
          <el-button type="primary" icon="el-icon-check" @click="save" :loading="saving">保存</el-button>
        </div>
      </div>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="接入文档" name="docs">
          <div class="doc">
            <div class="doc-title">识别结果回调</div>
            <div class="doc-desc">
              当识别任务完成后，系统会向你配置的回调地址推送识别结果。建议回调接口在公网可访问，并返回 200 表示接收成功。
            </div>
            <div class="doc-block">
              <div class="doc-k">回调方式</div>
              <div class="doc-v">HTTP POST（JSON）</div>
            </div>
            <div class="doc-block">
              <div class="doc-k">示例负载</div>
              <pre class="doc-json">{{ examplePayload }}</pre>
            </div>

            <div class="doc-title" style="margin-top: 18px;">第三方接入说明（detect_api）</div>
            <div class="doc-desc">
              以下接口用于第三方系统以 HTTP 方式接入识别服务。所有接口均需携带 Access Token（Bearer）。
            </div>

            <div class="doc-block">
              <div class="doc-k" style="margin-bottom: 8px;">交互时序图</div>
              <div class="doc-sequence">
                <div class="seq-step">
                  <div class="seq-circle">1</div>
                  <div class="seq-text">
                    <strong>获取算法</strong>
                    <span>客户端调用 <span class="mono">GET /v1/detect/all_rules</span> 获取当前账户可用的算法及标识</span>
                  </div>
                </div>
                <div class="seq-step">
                  <div class="seq-circle">2</div>
                  <div class="seq-text">
                    <strong>创建任务</strong>
                    <span>客户端调用 <span class="mono">POST /v1/detect/img</span> 提交图片及需要执行的算法，服务端返回任务 ID</span>
                  </div>
                </div>
                <div class="seq-step">
                  <div class="seq-circle">3</div>
                  <div class="seq-text">
                    <strong>获取结果（两种方式）</strong>
                    <div style="margin-top: 4px;">
                      <div><el-tag size="mini" type="info">方式 A</el-tag> <strong>被动接收：</strong>若已配置回调地址，服务端在处理完成后主动 POST 推送结果</div>
                      <div style="margin-top: 4px;"><el-tag size="mini" type="info">方式 B</el-tag> <strong>主动轮询：</strong>客户端定时调用 <span class="mono">GET /v1/detect/result/pull</span> 拉取已完成的结果</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="doc-block">
              <div class="doc-k">认证方式</div>
              <div class="doc-v">Header：Authorization: Bearer &lt;access_token&gt;</div>
            </div>

            <div class="doc-block">
              <div class="doc-k">1) 创建识别任务</div>
              <div class="doc-v">POST /v1/detect/img</div>
              <div class="doc-v muted-line">入参：image_url（必填）、detect_alg（必填，数组）、algorithm_type（可选：standard / accurate）</div>
              <div class="doc-v muted-line" style="margin-top: 6px;">请求示例</div>
              <pre class="doc-json">{{ detectImgReq }}</pre>
              <div class="doc-v muted-line" style="margin-top: 6px;">响应示例</div>
              <pre class="doc-json">{{ detectImgResp }}</pre>
            </div>

            <div class="doc-block">
              <div class="doc-k">2) 拉取识别结果（轮询）</div>
              <div class="doc-v">GET /v1/detect/result/pull?limit=20</div>
              <div class="doc-v muted-line">说明：拉取当前用户已完成（success / fail）的结果，并将其状态置为 output（避免重复拉取）。</div>
              <div class="doc-v muted-line" style="margin-top: 6px;">响应示例</div>
              <pre class="doc-json">{{ detectPullResp }}</pre>
            </div>

            <div class="doc-block">
              <div class="doc-k">3) 获取可用算法列表</div>
              <div class="doc-v">GET /v1/detect/all_rules</div>
              <div class="doc-v muted-line">说明：返回当前用户已授权且启用的算法（含价格）。</div>
              <div class="doc-v muted-line" style="margin-top: 6px;">响应示例</div>
              <pre class="doc-json">{{ detectRulesResp }}</pre>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="回调配置" name="callback">
          <el-form ref="form" :model="form" :rules="rules" label-width="120px" class="form">
            <el-form-item label="启用回调">
              <el-switch v-model="form.enabled" active-text="启用" inactive-text="关闭" />
              <div class="form-tip">
                启用后，识别完成会由服务端向回调地址 POST 推送结果。
              </div>
            </el-form-item>
            <el-form-item label="回调地址" prop="url">
              <el-input v-model="form.url" placeholder="https://example.com/webhook/recognition" clearable />
              <div class="form-tip">
                识别任务完成后推送结果到该地址。建议使用 HTTPS，并在服务端做鉴权与幂等处理。
              </div>
            </el-form-item>

            <el-form-item label="回调Token">
              <el-input v-model="form.token" placeholder="用于回调接口鉴权（可选）" clearable show-password />
              <div class="form-tip">
                若你的回调接口需要鉴权，平台将携带 Authorization: Bearer &lt;token&gt; 及 X-Callback-Token 请求头。
              </div>
            </el-form-item>

            <el-form-item label="测试回调">
              <div class="test-row">
                <el-input v-model="form.testBusId" placeholder="bus_id" clearable style="max-width: 320px;" />
                <el-button :loading="testing" type="primary" plain icon="el-icon-position" @click="testCallback">发送测试</el-button>
              </div>
              <div class="form-tip">
                将以 POST 方式发送：{"bus_id": bus_id, "time": "YYYY-MM-DD HH:mm:ss", "detect_data": {...}}
              </div>
              <div v-if="testResult" class="test-result">
                <div class="test-meta">
                  <el-tag size="mini" :type="testResult.ok ? 'success' : 'danger'">{{ testResult.ok ? '成功' : '失败' }}</el-tag>
                  <span class="test-text">{{ testResult.text }}</span>
                </div>
                <pre class="test-json">{{ testResult.payload }}</pre>
              </div>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { getRecognitionCallbackUrl, setRecognitionCallbackUrl, getRecognitionCallbackEnabled, setRecognitionCallbackEnabled } from '@/services/auth'
import userService from '@/services/user.service'

export default {
  name: 'Settings',
  data() {
    return {
      activeTab: 'docs',
      saving: false,
      testing: false,
      testResult: null,
      form: {
        enabled: false,
        url: '',
        token: '',
        testBusId: ''
      },
      rules: {
        url: [
          {
            validator: (rule, value, cb) => {
              if (!this.form.enabled) return cb()
              const v = String(value || '').trim()
              if (!v) return cb(new Error('请输入回调地址'))
              if (!/^https?:\/\/.+/i.test(v)) return cb(new Error('回调地址需以 http:// 或 https:// 开头'))
              return cb()
            },
            trigger: 'blur'
          }
        ]
      },
      examplePayload: JSON.stringify(
        {
          bus_id: '71226e4794794b03a820f02d644c3e64',
          time: '2026-04-10 09:12:01',
          detect_data: {
            topic: 'detect_success',
            result: {
              label: 'text',
              confidence: 98.3
            }
          }
        },
        null,
        2
      ),
      detectImgReq: JSON.stringify(
        {
          image_url: 'https://example.com/images/demo.jpg',
          detect_alg: ['ocr'],
          algorithm_type: 'standard'
        },
        null,
        2
      ),
      detectImgResp: JSON.stringify(
        {
          error_code: 0,
          msg: 'External recognition result created successfully',
          data: {
            id: '71226e4794794b03a820f02d644c3e64',
            image_no: 'IMG20260409112107001',
            image_url: 'https://example.com/images/demo.jpg',
            thumbnail_url: 'http://minio.example.com/external_thumbs/demo_thumb.jpg',
            algorithm_type: 'standard'
          }
        },
        null,
        2
      ),
      detectPullResp: JSON.stringify(
        {
          error_code: 0,
          msg: 'ok',
          data: {
            total: 1,
            list: [
              {
                id: '71226e4794794b03a820f02d644c3e64',
                image_no: 'IMG20260409112107001',
                image_url: 'https://example.com/images/demo.jpg',
                thumbnail_url: 'http://minio.example.com/external_thumbs/demo_thumb.jpg',
                algorithm_type: 'standard',
                status: 'success',
                detect_data: { label: 'text', confidence: 98.3 },
                create_time: '2026-04-10 09:12:00'
              }
            ]
          }
        },
        null,
        2
      ),
      detectRulesResp: JSON.stringify(
        {
          error_code: 0,
          msg: 'ok',
          data: [
            { id: 'ocr', ai_name: '通用OCR', price: 0.35, description: '文本识别' }
          ]
        },
        null,
        2
      )
    }
  },
  mounted() {
    this.form.enabled = getRecognitionCallbackEnabled()
    this.form.url = getRecognitionCallbackUrl()
    this.pullServerConfig()
  },
  methods: {
    async pullServerConfig() {
      try {
        const res = await userService.getCallbackConfig()
        if (res?.error_code === 0) {
          const url = String(res.data?.callback_url || '')
          const token = String(res.data?.callback_token || '')
          const enabledFromServer = Number(res.data?.callback_enabled || 1) === 1
          const effectiveEnabled = enabledFromServer && !!url
          this.form.url = url
          this.form.token = token
          this.form.enabled = effectiveEnabled
          setRecognitionCallbackUrl(url)
          setRecognitionCallbackEnabled(effectiveEnabled)
          return
        }
      } catch (e) {
        void e
      }
    },
    save() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.saveInner()
      })
    },
    async saveInner() {
      this.saving = true
      try {
        const enabled = !!this.form.enabled
        const url = enabled ? this.form.url : ''
        setRecognitionCallbackEnabled(enabled)
        setRecognitionCallbackUrl(url)
        const payload = {
          callback_url: enabled ? this.form.url : '',
          callback_enabled: enabled ? 1 : 2,
          callback_token: String(this.form.token || '').trim()
        }
        const res = await userService.updateCallbackConfig(payload)
        if (res?.error_code !== 0) {
          this.$message.error(res?.msg || '保存失败')
          return
        }
        this.$message.success('已保存')
      } catch (e) {
        this.$message.error(e?.message || '网络错误')
      } finally {
        this.saving = false
      }
    },
    async testCallback() {
      this.testResult = null
      this.$refs.form.validateField('url', async err => {
        if (err) return
        this.testing = true
        try {
          const res = await userService.testCallback({
            callback_url: this.form.url,
            callback_token: String(this.form.token || '').trim(),
            bus_id: this.form.testBusId || undefined,
            detect_data: {
              topic: 'test_callback',
              note: 'from view_way_ui settings',
              result: { label: 'test', confidence: 99.9 }
            }
          })
          if (res?.error_code !== 0) {
            this.testResult = {
              ok: false,
              text: res?.msg || '测试失败',
              payload: ''
            }
            return
          }
          const sc = res.data?.status_code
          this.testResult = {
            ok: Number(sc) >= 200 && Number(sc) < 300,
            text: `HTTP ${sc} · 已发送`,
            payload: JSON.stringify(res.data, null, 2)
          }
        } catch (e) {
          this.testResult = {
            ok: false,
            text: e?.message || '网络错误',
            payload: ''
          }
        } finally {
          this.testing = false
        }
      })
    }
  }
}
</script>

<style scoped>
.settings-wrapper {
  padding: 8px;
}

.page-card {
  border-radius: 12px;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.title-main {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1.2;
}

.title-sub {
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.doc {
  max-width: 860px;
  padding: 10px 2px;
}

.doc-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--color-text);
}

.doc-desc {
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.7;
}

.doc-block {
  margin-top: 12px;
}

.doc-k {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-secondary);
}

.doc-v {
  margin-top: 6px;
  font-size: 13px;
  color: var(--color-text);
}

.muted-line {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.doc-json {
  margin-top: 8px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: rgba(15, 23, 42, 0.02);
  font-size: 12px;
  line-height: 1.7;
  color: rgba(15, 23, 42, 0.86);
  max-height: 360px;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.form {
  max-width: 760px;
  padding: 10px 2px;
}

.form-tip {
  margin-top: 6px;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.test-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.test-result {
  margin-top: 10px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: rgba(15, 23, 42, 0.02);
}

.test-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.test-text {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.test-json {
  margin-top: 8px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: #fff;
  font-size: 12px;
  line-height: 1.7;
  color: rgba(15, 23, 42, 0.86);
  max-height: 260px;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.doc-sequence {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #fafbfc;
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.seq-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.seq-circle {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  margin-top: 2px;
}

.seq-text {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.seq-text strong {
  color: var(--color-text);
  margin-bottom: 2px;
}

.mono {
  font-family: ui-monospace, monospace;
  background: #eef2f6;
  padding: 2px 4px;
  border-radius: 4px;
  color: #0366d6;
}
</style>
