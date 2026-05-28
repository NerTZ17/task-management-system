<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { z } from 'zod'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  task: {
    type: Object,
    default: null,
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'submit'])

const formError = ref('')
const showConfirmModal = ref(false)
const pendingPayload = ref(null)
const pendingChanges = ref([])

const form = reactive({
  title: '',
  description: '',
  status: 'pending',
  deadline: '',
})

const fieldErrors = reactive({
  title: '',
  description: '',
  status: '',
  deadline: '',
})

const statusOptions = [
  {
    value: 'pending',
    label: 'Pending',
  },
  {
    value: 'in-progress',
    label: 'In Progress',
  },
  {
    value: 'done',
    label: 'Done',
  },
]

const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  status: z.enum(['pending', 'in-progress', 'done'], {
    message: 'Status is required',
  }),
  deadline: z.string().trim().min(1, 'Deadline is required'),
})

const isEditing = computed(() => Boolean(props.task))

const isContentLocked = computed(() => {
  return props.task?.status === 'in-progress' || props.task?.status === 'done'
})

const formatDateForInput = (date) => {
  if (!date) return ''

  return new Date(date).toISOString().slice(0, 10)
}

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '-'

  return value
}

const clearFieldErrors = () => {
  fieldErrors.title = ''
  fieldErrors.description = ''
  fieldErrors.status = ''
  fieldErrors.deadline = ''
}

const resetForm = () => {
  form.title = ''
  form.description = ''
  form.status = 'pending'
  form.deadline = ''

  formError.value = ''
  clearFieldErrors()

  showConfirmModal.value = false
  pendingPayload.value = null
  pendingChanges.value = []
}

const validateForm = () => {
  clearFieldErrors()

  const result = taskSchema.safeParse({
    title: form.title,
    description: form.description,
    status: form.status,
    deadline: form.deadline,
  })

  if (result.success) {
    return true
  }

  result.error.issues.forEach((issue) => {
    const field = issue.path[0]

    if (field && fieldErrors[field] !== undefined) {
      fieldErrors[field] = issue.message
    }
  })

  return false
}

const isStatusDisabled = (status) => {
  if (!props.task) return false

  if (props.task.status === 'in-progress') {
    return status === 'pending'
  }

  if (props.task.status === 'done') {
    return status === 'pending' || status === 'in-progress'
  }

  return false
}

const buildChanges = (payload) => {
  const currentValues = {
    title: props.task.title || '',
    description: props.task.description || '',
    status: props.task.status || 'pending',
    deadline: formatDateForInput(props.task.deadline),
  }

  const nextValues = {
    title: payload.title,
    description: payload.description || '',
    status: payload.status,
    deadline: payload.deadline || '',
  }

  const fields = [
    {
      key: 'title',
      label: 'Title',
    },
    {
      key: 'description',
      label: 'Description',
    },
    {
      key: 'status',
      label: 'Status',
    },
    {
      key: 'deadline',
      label: 'Deadline',
    },
  ]

  return fields
    .filter((field) => currentValues[field.key] !== nextValues[field.key])
    .map((field) => ({
      label: field.label,
      from: formatValue(currentValues[field.key]),
      to: formatValue(nextValues[field.key]),
    }))
}

watch(
  () => props.show,
  (isShown) => {
    if (!isShown) return

    if (props.task) {
      form.title = props.task.title || ''
      form.description = props.task.description || ''
      form.status = props.task.status || 'pending'
      form.deadline = formatDateForInput(props.task.deadline)

      formError.value = ''
      clearFieldErrors()
      showConfirmModal.value = false
      pendingPayload.value = null
      pendingChanges.value = []

      return
    }

    resetForm()
  },
)

const handleClose = () => {
  if (props.saving) return

  resetForm()
  emit('close')
}

const handleSubmit = () => {
  formError.value = ''

  if (!validateForm()) {
    formError.value = 'Please complete the required fields'
    return
  }

  if (isStatusDisabled(form.status)) {
    formError.value = 'Task status cannot be moved backward'
    return
  }

  if (isContentLocked.value) {
    const nextTitle = form.title.trim()
    const nextDescription = form.description.trim()

    const currentTitle = props.task?.title || ''
    const currentDescription = props.task?.description || ''

    if (nextTitle !== currentTitle || nextDescription !== currentDescription) {
      formError.value =
        'Title and description cannot be changed after task is in progress or done'
      return
    }
  }

  const payload = {
    title: isContentLocked.value ? props.task.title : form.title.trim(),
    description: isContentLocked.value
      ? props.task.description || ''
      : form.description.trim(),
    status: form.status,
    deadline: form.deadline,
  }

  if (!isEditing.value) {
    emit('submit', payload)
    return
  }

  const changes = buildChanges(payload)

  if (changes.length === 0) {
    formError.value = 'No changes detected'
    return
  }

  pendingPayload.value = payload
  pendingChanges.value = changes
  showConfirmModal.value = true
}

const cancelConfirm = () => {
  if (props.saving) return

  showConfirmModal.value = false
}

const confirmSubmit = () => {
  emit('submit', pendingPayload.value)
}
</script>

<template>
  <div v-if="show" class="task-modal-backdrop" @click.self="handleClose">
    <section class="task-modal">
      <div class="task-modal__header">
        <div>
          <p class="eyebrow">{{ isEditing ? 'Edit' : 'Create' }}</p>
          <h2>{{ isEditing ? 'Edit task' : 'Add task' }}</h2>
        </div>

        <button type="button" class="task-modal__close" @click="handleClose">
          ×
        </button>
      </div>

      <form @submit.prevent="handleSubmit" novalidate>
        <div v-if="formError" class="alert alert-danger task-alert">
          {{ formError }}
        </div>

        <div class="mb-3">
          <label for="task-title" class="form-label">
            Title <span class="text-danger">*</span>
          </label>

          <input
            id="task-title"
            v-model="form.title"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': fieldErrors.title }"
            placeholder="Task title"
            :disabled="isContentLocked"
          />

          <small v-if="fieldErrors.title" class="field-error">
            {{ fieldErrors.title }}
          </small>
        </div>

        <div class="mb-3">
          <label for="task-description" class="form-label">
            Description <span class="text-danger">*</span>
          </label>

          <textarea
            id="task-description"
            v-model="form.description"
            class="form-control"
            :class="{ 'is-invalid': fieldErrors.description }"
            rows="4"
            placeholder="Task description"
            :disabled="isContentLocked"
          ></textarea>

          <small v-if="fieldErrors.description" class="field-error">
            {{ fieldErrors.description }}
          </small>

          <small v-if="isContentLocked" class="form-text text-muted">
            Title and description cannot be edited after a task is in progress or done.
          </small>
        </div>

        <div class="mb-3">
          <label for="task-status" class="form-label">
            Status <span class="text-danger">*</span>
          </label>

          <select
            id="task-status"
            v-model="form.status"
            class="form-select"
            :class="{ 'is-invalid': fieldErrors.status }"
          >
            <option
              v-for="option in statusOptions"
              :key="option.value"
              :value="option.value"
              :disabled="isStatusDisabled(option.value)"
            >
              {{ option.label }}
            </option>
          </select>

          <small v-if="fieldErrors.status" class="field-error">
            {{ fieldErrors.status }}
          </small>

          <small v-if="props.task?.status === 'in-progress'" class="form-text text-muted">
            In-progress task cannot be moved back to pending.
          </small>

          <small v-if="props.task?.status === 'done'" class="form-text text-muted">
            Done task cannot be moved back to in-progress or pending.
          </small>
        </div>

        <div class="mb-4">
          <label for="task-deadline" class="form-label">
            Deadline <span class="text-danger">*</span>
          </label>

          <input
            id="task-deadline"
            v-model="form.deadline"
            type="date"
            class="form-control"
            :class="{ 'is-invalid': fieldErrors.deadline }"
          />

          <small v-if="fieldErrors.deadline" class="field-error">
            {{ fieldErrors.deadline }}
          </small>
        </div>

        <div class="task-modal__actions">
          <button type="button" class="btn btn-outline-secondary" @click="handleClose">
            Cancel
          </button>

          <button type="submit" class="btn btn-dark" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            {{ saving ? 'Saving...' : isEditing ? 'Review changes' : 'Create task' }}
          </button>
        </div>
      </form>
    </section>

    <section v-if="showConfirmModal" class="task-confirm-modal" @click.stop>
      <div class="task-confirm-modal__header">
        <h3>Are you sure?</h3>
        <p>Please review the changes before saving this task.</p>
      </div>

      <div class="task-change-list">
        <div
          v-for="change in pendingChanges"
          :key="change.label"
          class="task-change-item"
        >
          <span class="task-change-item__label">{{ change.label }}</span>

          <div class="task-change-item__value">
            <span>{{ change.from }}</span>
            <span class="task-change-item__arrow">→</span>
            <strong>{{ change.to }}</strong>
          </div>
        </div>
      </div>

      <div class="task-modal__actions mt-4">
        <button type="button" class="btn btn-outline-secondary" @click="cancelConfirm">
          Back
        </button>

        <button type="button" class="btn btn-dark" :disabled="saving" @click="confirmSubmit">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
          {{ saving ? 'Saving...' : 'Yes, save task' }}
        </button>
      </div>
    </section>
  </div>
</template>