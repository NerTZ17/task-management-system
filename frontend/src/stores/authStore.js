import { defineStore } from 'pinia'
import api from '@/api/axios'

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
  },
})