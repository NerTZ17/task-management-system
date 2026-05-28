<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  task: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <div v-if="show" class="task-modal-backdrop" @click.self="emit('close')">
    <section class="task-confirm-modal" @click.stop>
      <div class="task-confirm-modal__header">
        <h3>Delete task?</h3>
        <p>
          Are you sure you want to delete this task? This action cannot be undone.
        </p>
      </div>

      <div v-if="task" class="task-delete-preview">
        <span class="task-delete-preview__label">Task</span>
        <strong>{{ task.title }}</strong>
        <p v-if="task.description">{{ task.description }}</p>
      </div>

      <div class="task-modal__actions mt-4">
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="loading"
          @click="emit('close')"
        >
          Cancel
        </button>

        <button
          type="button"
          class="btn btn-danger"
          :disabled="loading"
          @click="emit('confirm')"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Deleting...' : 'Yes, delete task' }}
        </button>
      </div>
    </section>
  </div>
</template>