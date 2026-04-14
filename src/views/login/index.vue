<template>
  <div class="login-container">
    <div class="login-form">
      <div class="logo-container">
        <div class="logo"></div>
        <h1 class="login-title">算法管理平台</h1>
        <p class="login-subtitle">企业级算法管理系统</p>
      </div>
      
      <form class="form" @submit.prevent="handleLogin">
        <div class="form-group">
          <input 
            type="text" 
            class="form-input" 
            placeholder="app key" 
            v-model="username"
          >
        </div>
        <div class="form-group">
          <input 
            type="password" 
            class="form-input" 
            placeholder="密码" 
            v-model="password"
          >
        </div>
        <button 
          type="submit" 
          class="login-button"
          :disabled="loading"
        >
          <i v-if="loading" class="el-icon-loading"></i>
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      
      <div class="footer">
        <p class="copyright">© 2026 算法管理平台. 保留所有权利</p>
      </div>
    </div>
  </div>
</template>

<script>
import { login } from '@/services/auth.service'
import { Message } from 'element-ui'

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      loading: false
    }
  },
  methods: {
    handleLogin() {
      this.loading = true
      login({
        app_key: this.username,
        app_secret: this.password
      })
        .then(() => {
          this.loading = false
          Message.success('登录成功')
          this.$router.push('/upload')
        })
        .catch(error => {
          this.loading = false
          Message.error(error.message || '登录失败')
        })
    }
  }
}
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
  height: 100%;
  overflow: hidden;
  width: 100%;
}

/* 隐藏滚动条 */
body::-webkit-scrollbar {
  display: none;
}

body {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  min-height: 100%;
  background: url('../../assets/back.jpg') no-repeat center center fixed;
  background-size: cover;
  padding: 20px;
  margin: 0;
  position: relative;
  width: 100%;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1;
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 48px 40px 36px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  z-index: 2;
  box-sizing: border-box;
}

.login-form:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.15);
}

.logo-container {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  font-weight: bold;
  animation: pulse 2s infinite;
  background: url('../../assets/logo.png') no-repeat center center;
  background-size: contain;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(24, 144, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
  }
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: #666666;
  margin-bottom: 0;
}

.form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  background-color: #ffffff;
}

.login-button {
  width: 100%;
  padding: 14px;
  background-color: #1890ff;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.login-button:hover {
  background-color: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.login-button:active {
  transform: translateY(0);
}

.footer {
  text-align: center;
  margin-top: 32px;
}

.copyright {
  font-size: 12px;
  color: #999999;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-form {
    padding: 32px 24px 24px;
  }
  
  .logo {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
  
  .login-title {
    font-size: 20px;
  }
}
</style>
