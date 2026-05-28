<script setup>
import '@/assets/auth.css'

import { reactive, ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
})

const touched = reactive({
  name: false,
  email: false,
  password: false,
})

const showPassword = ref(false)
const serverError = ref('')
const successMessage = ref('')

const nameError = computed(() => {
  if (!touched.name) return ''
  if (!form.name.trim()) return 'Name is required'
  if (form.name.trim().length < 2) return 'Name must be at least 2 characters'

  return ''
})

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
  if (form.password.length < 6) return 'Password must be at least 6 characters'

  return ''
})

const isFormValid = computed(() => {
  return (
    form.name.trim() &&
    form.email.trim() &&
    form.password &&
    !nameError.value &&
    !emailError.value &&
    !passwordError.value
  )
})

const handleSubmit = async () => {
  touched.name = true
  touched.email = true
  touched.password = true

  serverError.value = ''
  successMessage.value = ''

  if (!isFormValid.value) return

  try {
    await authStore.register({
      name: form.name,
      email: form.email,
      password: form.password,
    })

    successMessage.value = 'Account created successfully. Redirecting to login...'

    setTimeout(() => {
      router.push('/login')
    }, 700)
  } catch (error) {
    serverError.value = error.response?.data?.message || 'Unable to register. Please try again.'
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <div class="auth-header">
        <div class="auth-logo">TMS</div>
        <h1>Create account</h1>
        <p>Register with your name, email, and password.</p>
      </div>

      <div v-if="serverError" class="alert alert-danger auth-alert">
        {{ serverError }}
      </div>

      <div v-if="successMessage" class="alert alert-success auth-alert">
        {{ successMessage }}
      </div>

      <form @submit.prevent="handleSubmit" novalidate>
        <div class="form-field">
          <label for="name">Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': nameError }"
            placeholder="Your name"
            autocomplete="name"
            @blur="touched.name = true"
          />
          <small v-if="nameError" class="field-error">
            {{ nameError }}
          </small>
        </div>

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
              placeholder="Minimum 6 characters"
              autocomplete="new-password"
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
          {{ authStore.loading ? 'Creating account...' : 'Create account' }}
        </button>
      </form>

      <p class="auth-footer">
        Already have an account?
        <RouterLink to="/login">Sign in</RouterLink>
      </p>
    </section>
  </main>
</template>