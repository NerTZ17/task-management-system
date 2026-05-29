import { defineStore } from 'pinia'
import api from '@/api/axios'

const getTokenPayload = (token) => {
  try {
    const payload = token.split('.')[1]

    if (!payload) return null

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')

    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

const isTokenExpired = (token) => {
  const payload = getTokenPayload(token)

  if (!payload?.exp) return true

  return Date.now() >= payload.exp * 1000
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },

  actions: {
    async register(payload) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post('/auth/register', payload)
        return response.data
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Registration failed. Please try again.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(payload) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post('/auth/login', payload)

        const { token, data } = response.data

        this.token = token
        this.user = data.user

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.removeItem('auth_message')

        return response.data
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Login failed. Please check your credentials.'
        throw error
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.error = null

      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    validateSession() {
      if (!this.token) {
        return false
      }

      if (isTokenExpired(this.token)) {
        this.logout()

        localStorage.setItem(
          'auth_message',
          'Your login session has expired. Please sign in again.',
        )

        return false
      }

      return true
    },
  },
})