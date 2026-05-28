<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <main class="dashboard-placeholder">
    <div class="dashboard-card">
      <p class="eyebrow">Dashboard</p>
      <h1>Welcome, {{ authStore.user?.name || 'User' }}</h1>
      <p>
        Login berhasil. Setelah ini kita lanjut membuat halaman task list, create,
        edit, delete, dan filter status.
      </p>

      <button class="btn auth-button" @click="handleLogout">
        Logout
      </button>
    </div>
  </main>
</template>