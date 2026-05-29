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
      <RouterLink to="/tasks" class="app-navbar__brand">
        <img
          src="/kanggo-full-logo.png"
          alt="PT Kanggo"
          class="app-navbar__logo"
        />

        <span>Test Case | TMS</span>
      </RouterLink>
      
      <div class="app-navbar__user">
        <span class="app-navbar__name">Hi, {{ userName }}</span>
        <button type="button" class="btn btn-outline-dark btn-sm" @click="handleLogout">
          Logout
        </button>
      </div>
    </div>
  </nav>
</template>