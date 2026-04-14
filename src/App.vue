<template>
  <div id="app">
    <template v-if="showLayout">
      <div class="app-shell">
        <aside class="app-sidebar" :class="{ collapsed }">
          <div class="brand" @click="$router.push('/upload')">
            <i class="el-icon-s-marketing"></i>
            <span v-if="!collapsed">ViewWay AI</span>
          </div>
          <el-menu
            class="side-menu"
            :default-active="activeMenu"
            router
            :collapse="collapsed"
            :collapse-transition="false"
            :unique-opened="true"
          >
            <el-menu-item index="/upload">
              <i class="el-icon-picture"></i>
              <span slot="title">图片识别</span>
            </el-menu-item>
            <el-menu-item index="/cost">
              <i class="el-icon-money"></i>
              <span slot="title">消耗记录</span>
            </el-menu-item>
            <el-menu-item v-if="canViewAccounts" index="/accounts">
              <i class="el-icon-user"></i>
              <span slot="title">账户管理</span>
            </el-menu-item>
            <el-menu-item v-if="canViewAlgorithms" index="/algorithms">
              <i class="el-icon-data-analysis"></i>
              <span slot="title">算法管理</span>
            </el-menu-item>
            <el-menu-item index="/settings">
              <i class="el-icon-setting"></i>
              <span slot="title">系统设置</span>
            </el-menu-item>
          </el-menu>
        </aside>
        <div class="app-main">
          <header class="app-topbar">
            <div class="left-actions">
              <el-button type="text" icon="el-icon-s-fold" @click="toggleCollapse" />
            </div>
            <div class="right-actions">
              <el-dropdown @command="onUserCommand">
                <span class="user-chip">
                  <i class="el-icon-user-solid"></i>
                  <span class="name">{{ userName || '用户' }}</span>
                  <i class="el-icon-arrow-down"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </header>
          <main class="app-content">
            <router-view />
          </main>
        </div>
      </div>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script>
import { logout } from '@/services/auth.service'
import { getAuthMenu, getUserName } from '@/services/auth'
import { Message } from 'element-ui'
export default {
  name: 'App',
  data() {
    return {
      collapsed: false
    }
  },
  computed: {
    userName() {
      void this.$route.path
      return getUserName()
    },
    authMenu() {
      void this.$route.path
      return getAuthMenu()
    },
    canViewAccounts() {
      return this.authMenu.includes('accounts')
    },
    canViewAlgorithms() {
      return this.authMenu.includes('algorithms')
    },
    activeMenu() {
      const p = this.$route.path || '/upload'
      return p
    },
    showLayout() {
      // 不在登录页且 token 存在时显示布局
      const noLayoutPages = ['/login', '/register']
      return !noLayoutPages.includes(this.$route.path)
    }
  },
  watch: {
    // 监听路由变化，同步菜单激活状态
    '$route.path': {
      handler() {
        // 如果需要同步 activeMenu 可以加在这里
      },
      immediate: true
    }
  },
  methods: {
    toggleCollapse() {
      this.collapsed = !this.collapsed
    },
    onUserCommand(cmd) {
      switch (cmd) {
        case 'logout':
          logout()
          Message.success('退出登录成功')
          this.$router.push('/login')
          break
      }
    }
  }
}
</script>

<style>
/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f0f4ff;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c8d8f8;
  border-radius: 4px;
  transition: background 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0b8f0;
}

/* 针对Firefox的滚动条样式 */
* {
  scrollbar-width: thin;
  scrollbar-color: #c8d8f8 #f0f4ff;
}

/* 确保body和html有合适的高度 */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#app {
  height: 100%;
  overflow: hidden;
}

.app-shell {
  display: flex;
  height: 100%;
  background: var(--color-page-bg);
}
.app-sidebar {
  width: 220px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.3s ease;
}
.app-sidebar.collapsed {
  width: 64px;
}
.brand {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  font-weight: 700;
  color: var(--color-primary);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
}
.brand i { font-size: 20px; }
.side-menu {
  border-right: none;
  flex: 1;
}
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.app-topbar {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 0 8px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}
.app-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 16px;
}
.user-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
}
</style>
