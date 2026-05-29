<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

let sessionInterval = null

onMounted(() => {
  sessionInterval = setInterval(() => {
    if (!authStore.token) return

    const isValidSession = authStore.validateSession()

    if (!isValidSession && route.path !== '/login') {
      router.push('/login')
    }
  }, 5000)
})

onUnmounted(() => {
  clearInterval(sessionInterval)
})
</script>

<template>
  <RouterView />
</template>