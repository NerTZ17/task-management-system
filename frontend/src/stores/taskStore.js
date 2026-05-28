import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    loading: false,
    saving: false,
    error: null,
    selectedStatus: 'all',
  }),

  actions: {
    async fetchTasks(status = this.selectedStatus) {
      this.loading = true
      this.error = null
      this.selectedStatus = status

      try {
        const params = {}

        if (status && status !== 'all') {
          params.status = status
        }

        const response = await api.get('/tasks', { params })
        this.tasks = response.data.data.tasks

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch tasks'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createTask(payload) {
      this.saving = true
      this.error = null

      try {
        const response = await api.post('/tasks', payload)
        await this.fetchTasks(this.selectedStatus)

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create task'
        throw error
      } finally {
        this.saving = false
      }
    },

    async updateTask(id, payload) {
      this.saving = true
      this.error = null

      try {
        const response = await api.put(`/tasks/${id}`, payload)
        await this.fetchTasks(this.selectedStatus)

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update task'
        throw error
      } finally {
        this.saving = false
      }
    },

    async deleteTask(id) {
      this.loading = true
      this.error = null

      try {
        const response = await api.delete(`/tasks/${id}`)
        await this.fetchTasks(this.selectedStatus)

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete task'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})