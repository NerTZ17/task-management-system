<script setup>
import '@/assets/auth.css'

import { reactive, ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

const touched = reactive({
  email: false,
  password: false,
})

const showPassword = ref(false)
const serverError = ref('')
const authMessage = localStorage.getItem('auth_message')

if (authMessage) {
  serverError.value = authMessage
  localStorage.removeItem('auth_message')
}

const emailError = computed(() => {
  if (!touched.email) return ''
  if (!form.email.trim()) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    return 'Please enter a valid email address'
  }

  return ''
})

const passwordError = computed(() => {
  if (!touched.password) return ''
  if (!form.password) return 'Password is required'

  return ''
})

const isFormValid = computed(() => {
  return form.email.trim() && form.password && !emailError.value && !passwordError.value
})

const handleSubmit = async () => {
  touched.email = true
  touched.password = true
  serverError.value = ''

  if (!isFormValid.value) return

  try {
    await authStore.login({
      email: form.email,
      password: form.password,
    })

    router.push('/tasks')
  } catch (error) {
    serverError.value = error.response?.data?.message || 'Unable to login. Please try again.'
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <div class="auth-header auth-header--center">
        <div class="auth-brand-stack">
          <img
            src="/kanggo-full-logo.png"
            alt="PT Kanggo"
            class="auth-brand-logo"
          />

          <p class="auth-brand-label">Test Case | TMS</p>

          <h1>Sign in</h1>
        </div>

        <p>Enter your email and password to continue.</p>
      </div>

      <div v-if="serverError" class="alert alert-danger auth-alert">
        {{ serverError }}
      </div>

      <form @submit.prevent="handleSubmit" novalidate>
        <div class="form-field">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-control"
            :class="{ 'is-invalid': emailError }"
            placeholder="you@example.com"
            autocomplete="email"
            @blur="touched.email = true"
          />
          <small v-if="emailError" class="field-error">
            {{ emailError }}
          </small>
        </div>

        <div class="form-field">
          <label for="password">Password</label>

          <div class="password-wrapper">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-control"
              :class="{ 'is-invalid': passwordError }"
              placeholder="Enter your password"
              autocomplete="current-password"
              @blur="touched.password = true"
            />

            <button type="button" class="password-toggle" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>

          <small v-if="passwordError" class="field-error">
            {{ passwordError }}
          </small>
        </div>

        <button type="submit" class="btn auth-submit" :disabled="authStore.loading">
          <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ authStore.loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <p class="auth-footer">
        Don’t have an account?
        <RouterLink to="/register">Create account</RouterLink>
      </p>
    </section>
  </main>
</template>