<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const userName = computed(() => authStore.user?.name || 'User')

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="app-navbar">
    <div class="container app-navbar__content">
      <div>
        <RouterLink to="/tasks" class="app-navbar__brand">
          TMS
        </RouterLink>
        <p class="app-navbar__subtitle">Task Management System</p>
      </div>

      <div class="app-navbar__user">
        <span class="app-navbar__name">Hi, {{ userName }}</span>
        <button type="button" class="btn btn-outline-dark btn-sm" @click="handleLogout">
          Logout
        </button>
      </div>
    </div>
  </nav>
</template>