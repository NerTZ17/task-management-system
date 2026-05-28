<script setup>
import '@/assets/tasks.css'

import { computed, onMounted, ref, watch } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import TaskFormModal from '@/components/TaskFormModal.vue'
import DeleteTaskModal from '@/components/DeleteTaskModal.vue'
import { useTaskStore } from '@/stores/taskStore'

const taskStore = useTaskStore()

const serverError = ref('')
const showTaskModal = ref(false)
const selectedTask = ref(null)
const taskToDelete = ref(null)
const showDeleteModal = ref(false)

const searchQuery = ref('')
const pageSizeOptions = [5, 10, 15, 20]
const pageSize = ref(5)
const currentPage = ref(1)

const emptyMessage = computed(() => {
  if (searchQuery.value.trim()) {
    return 'No tasks match your search.'
  }

  if (taskStore.selectedStatus === 'all') {
    return 'No tasks yet. Create your first task to get started.'
  }

  return `No ${taskStore.selectedStatus} tasks found.`
})

const formatDateDisplay = (date) => {
  if (!date) return '-'

  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const fetchTasks = async (status = taskStore.selectedStatus) => {
  serverError.value = ''

  try {
    await taskStore.fetchTasks(status)
  } catch (error) {
    serverError.value = error.response?.data?.message || 'Unable to load tasks.'
  }
}

const handleStatusFilter = async (status) => {
  currentPage.value = 1
  searchQuery.value = ''
  await fetchTasks(status)
}

const openCreateModal = () => {
  selectedTask.value = null
  showTaskModal.value = true
}

const openEditModal = (task) => {
  selectedTask.value = task
  showTaskModal.value = true
}

const closeTaskModal = () => {
  showTaskModal.value = false
  selectedTask.value = null
}

const handleSubmitTask = async (payload) => {
  serverError.value = ''

  try {
    if (selectedTask.value) {
      await taskStore.updateTask(selectedTask.value.id, payload)
    } else {
      await taskStore.createTask(payload)
    }

    closeTaskModal()
  } catch (error) {
    serverError.value = error.response?.data?.message || 'Unable to save task.'
  }
}

const openDeleteModal = (task) => {
  taskToDelete.value = task
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  if (taskStore.loading) return

  taskToDelete.value = null
  showDeleteModal.value = false
}

const confirmDeleteTask = async () => {
  if (!taskToDelete.value) return

  serverError.value = ''

  try {
    await taskStore.deleteTask(taskToDelete.value.id)
    closeDeleteModal()
  } catch (error) {
    serverError.value = error.response?.data?.message || 'Unable to delete task.'
  }
}

const filteredTasks = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()

  if (!keyword) {
    return taskStore.tasks
  }

  return taskStore.tasks.filter((task) =>
    task.title.toLowerCase().includes(keyword),
  )
})

const totalTasks = computed(() => filteredTasks.value.length)

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(totalTasks.value / pageSize.value))
})

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value

  return filteredTasks.value.slice(start, end)
})

const paginationStart = computed(() => {
  if (totalTasks.value === 0) return 0

  return (currentPage.value - 1) * pageSize.value + 1
})

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * pageSize.value, totalTasks.value)
})

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return

  currentPage.value = page
}

watch(searchQuery, () => {
  currentPage.value = 1
})

watch(pageSize, () => {
  currentPage.value = 1
})

watch(totalTasks, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

onMounted(() => {
  fetchTasks('all')
})
</script>

<template>
  <div class="tasks-page">
    <AppNavbar />

    <main class="container tasks-content">
      <section class="tasks-hero">
        <div>
          <p class="eyebrow">Dashboard</p>
          <h1>Manage your tasks</h1>
          <p>Create, update, filter, and keep track of your personal tasks.</p>
        </div>

        <div class="tasks-hero__actions">
          <button type="button" class="btn btn-dark" @click="openCreateModal">
            Add Task
          </button>
        </div>
      </section>

      <div v-if="serverError" class="alert alert-danger">
        {{ serverError }}
      </div>

      <section class="task-card">
        <div>
          <h2>Task list</h2>
          <p>
            Showing {{ paginationStart }}-{{ paginationEnd }} of {{ totalTasks }} task(s)
            <span v-if="searchQuery.trim()"> matching "{{ searchQuery }}"</span>
          </p>
        </div>

        <div class="task-list-controls">
          <input
            v-model="searchQuery"
            type="search"
            class="form-control task-search"
            placeholder="Search task title..."
          />

          <select v-model.number="pageSize" class="form-select task-page-size">
            <option
              v-for="option in pageSizeOptions"
              :key="option"
              :value="option"
            >
              {{ option }} / page
            </option>
          </select>

          <select
            class="form-select task-filter"
            :value="taskStore.selectedStatus"
            @change="handleStatusFilter($event.target.value)"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div v-if="taskStore.loading" class="task-loading">
          <span class="spinner-border spinner-border-sm me-2"></span>
          Loading tasks...
        </div>

        <div v-else-if="taskStore.tasks.length === 0" class="task-empty">
          {{ emptyMessage }}
        </div>

        <div v-else class="table-responsive">
          <table class="table align-middle task-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Deadline</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="task in paginatedTasks" :key="task.id">
                <td>
                  <strong>{{ task.title }}</strong>
                  <p v-if="task.description" class="task-description">
                    {{ task.description }}
                  </p>
                </td>

                <td>
                  <span class="status-badge" :class="`status-badge--${task.status}`">
                    {{ task.status }}
                  </span>
                </td>

                <td>{{ formatDateDisplay(task.deadline) }}</td>

                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <button type="button" class="btn btn-outline-dark" @click="openEditModal(task)">
                      Edit
                    </button>
                    <button type="button" class="btn btn-outline-danger" @click="openDeleteModal(task)">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="totalTasks > 0" class="task-pagination">
            <p>
              Page {{ currentPage }} of {{ totalPages }}
            </p>

            <div class="task-pagination__actions">
              <button
                type="button"
                class="btn btn-outline-secondary btn-sm"
                :disabled="currentPage === 1"
                @click="goToPage(currentPage - 1)"
              >
                Previous
              </button>

              <button
                v-for="page in totalPages"
                :key="page"
                type="button"
                class="btn btn-sm"
                :class="page === currentPage ? 'btn-dark' : 'btn-outline-secondary'"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>

              <button
                type="button"
                class="btn btn-outline-secondary btn-sm"
                :disabled="currentPage === totalPages"
                @click="goToPage(currentPage + 1)"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <TaskFormModal
      :show="showTaskModal"
      :task="selectedTask"
      :saving="taskStore.saving"
      @close="closeTaskModal"
      @submit="handleSubmitTask"
    />

    <DeleteTaskModal
      :show="showDeleteModal"
      :task="taskToDelete"
      :loading="taskStore.loading"
      @close="closeDeleteModal"
      @confirm="confirmDeleteTask"
    />
  </div>
</template>