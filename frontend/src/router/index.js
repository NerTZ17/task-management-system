import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import TasksView from '@/views/TasksView.vue'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      guestOnly: true,
    },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: {
      guestOnly: true,
    },
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: TasksView,
    meta: {
      requiresAuth: true,
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth) {
    if (!authStore.token) {
      localStorage.setItem('auth_message', 'Please sign in to continue.')
      return '/login'
    }

    const isValidSession = authStore.validateSession()

    if (!isValidSession) {
      return '/login'
    }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    const isValidSession = authStore.validateSession()

    if (isValidSession) {
      return '/tasks'
    }
  }

  return true
})

export default router