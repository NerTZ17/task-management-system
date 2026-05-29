import { computed, ref, watch } from 'vue'

export function useTaskPagination(tasks) {
  const searchQuery = ref('')
  const pageSizeOptions = [5, 10, 15, 20]
  const pageSize = ref(5)
  const currentPage = ref(1)

  const filteredTasks = computed(() => {
    const keyword = searchQuery.value.trim().toLowerCase()

    if (!keyword) {
      return tasks.value
    }

    return tasks.value.filter((task) =>
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

  return {
    searchQuery,
    pageSizeOptions,
    pageSize,
    currentPage,
    filteredTasks,
    totalTasks,
    totalPages,
    paginatedTasks,
    paginationStart,
    paginationEnd,
    goToPage,
  }
}