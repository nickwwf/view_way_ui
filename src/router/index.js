import Vue from 'vue'
import Router from 'vue-router'
import { getToken, getAuthMenu } from '@/services/auth'

Vue.use(Router)

const constantRoutes = [
  {
    path: '/',
    redirect: '/upload'
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    redirect: '/upload'
  },
  {
    path: '/upload',
    component: () => import('@/views/upload/index'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cost',
    component: () => import('@/views/cost/index'),
    meta: { requiresAuth: true }
  },
  {
    path: '/accounts',
    component: () => import('@/views/accounts/index'),
    meta: { requiresAuth: true }
  },
  {
    path: '/algorithms',
    component: () => import('@/views/algorithms/index'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    component: () => import('@/views/settings/index'),
    meta: { requiresAuth: true }
  },
  {
    path: '/realtime-task',
    component: () => import('@/views/realtime-task/index'),
    meta: { requiresAuth: true }
  },
  {
    path: '/recognition/:id',
    component: () => import('@/views/recognition-detail/index'),
    meta: { requiresAuth: true }
  }
]

const router = new Router({
  routes: constantRoutes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const token = getToken()
  
  if (requiresAuth && !token) {
    next('/login')
  } else {
    const authMenu = getAuthMenu()
    if (to.path.startsWith('/accounts') && !authMenu.includes('accounts')) {
      next('/upload')
      return
    }
    if (to.path.startsWith('/algorithms') && !authMenu.includes('algorithms')) {
      next('/upload')
      return
    }
    next()
  }
})

export default router
