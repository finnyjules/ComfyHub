<script setup>
import { ref, computed, watch } from 'vue'
import { getCreatorWorkflows } from '../../data/services/creatorService.js'
import { categories } from '../../data/mock/generators/categories.js'
import WorkflowGrid from '../workflow/WorkflowGrid.vue'

const props = defineProps({
  creatorId: { type: String, required: true },
})

const workflows = ref([])
const total = ref(0)
const page = ref(1)
const totalPages = ref(0)
const sort = ref('popular')
const category = ref(null)
const isLoading = ref(false)
const isLoadingMore = ref(false)

const limit = 12

const sortOptions = [
  { id: 'popular', label: 'Popular' },
  { id: 'newest', label: 'Newest' },
  { id: 'runs', label: 'Most Runs' },
  { id: 'favorites', label: 'Most Favorites' },
]

const canLoadMore = computed(() => page.value < totalPages.value)

function fetchWorkflows(append = false) {
  if (append) {
    isLoadingMore.value = true
  } else {
    isLoading.value = true
  }

  try {
    const result = getCreatorWorkflows(props.creatorId, {
      page: page.value,
      limit,
      sort: sort.value,
      category: category.value,
    })
    if (append) {
      workflows.value = [...workflows.value, ...result.data]
    } else {
      workflows.value = result.data
    }

    total.value = result.total
    totalPages.value = result.totalPages
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

function loadMore() {
  if (canLoadMore.value) {
    page.value++
    fetchWorkflows(true)
  }
}

function handleSortChange(newSort) {
  sort.value = newSort
}

function handleCategoryChange(event) {
  const val = event.target.value
  category.value = val || null
}

// Reset and refetch when sort or category changes
watch([sort, category], () => {
  page.value = 1
  fetchWorkflows()
})

// Initial fetch
fetchWorkflows()
</script>

<template>
  <div class="profile-workflows">
    <!-- Controls -->
    <div class="profile-workflows__controls">
      <!-- Sort options -->
      <div class="profile-workflows__sort">
        <button
          v-for="option in sortOptions"
          :key="option.id"
          class="profile-workflows__sort-btn"
          :class="{ 'profile-workflows__sort-btn--active': sort === option.id }"
          @click="handleSortChange(option.id)"
        >
          {{ option.label }}
        </button>
      </div>

      <!-- Category filter -->
      <div class="profile-workflows__filter">
        <select
          class="profile-workflows__select"
          :value="category ?? ''"
          @change="handleCategoryChange"
        >
          <option value="">All Categories</option>
          <option
            v-for="cat in categories"
            :key="cat.id"
            :value="cat.id"
          >
            {{ cat.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Results count -->
    <p class="profile-workflows__count">
      {{ total }} workflow{{ total !== 1 ? 's' : '' }}
      <span v-if="category"> in {{ categories.find(c => c.id === category)?.label }}</span>
    </p>

    <!-- Loading -->
    <div v-if="isLoading" class="profile-workflows__loading">
      <div class="profile-workflows__spinner" />
      <p>Loading workflows...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="workflows.length === 0" class="profile-workflows__empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
      <h3 class="profile-workflows__empty-title">No workflows yet</h3>
      <p class="profile-workflows__empty-text">This creator has not published any workflows yet.</p>
    </div>

    <!-- Workflow grid -->
    <WorkflowGrid
      v-else
      :workflows="workflows"
      variant="compact"
      columns="4"
    />

    <!-- Load more -->
    <div v-if="canLoadMore && !isLoading" class="profile-workflows__load-more">
      <button
        class="profile-workflows__load-more-btn"
        :disabled="isLoadingMore"
        @click="loadMore"
      >
        <span v-if="isLoadingMore" class="profile-workflows__spinner profile-workflows__spinner--small" />
        <span v-else>Load more workflows</span>
      </button>
      <p class="profile-workflows__load-more-count">
        Showing {{ workflows.length }} of {{ total }}
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-workflows {
  // ===== CONTROLS =====
  &__controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-4;
    margin-bottom: $space-5;
    flex-wrap: wrap;

    @include respond-below('sm') {
      flex-direction: column;
      align-items: stretch;
    }
  }

  &__sort {
    display: flex;
    gap: $space-1;
    background: $color-bg-secondary;
    border-radius: $radius-md;
    padding: 2px;
  }

  &__sort-btn {
    padding: $space-2 $space-3;
    font-size: $text-xs;
    font-weight: $weight-medium;
    color: $color-text-tertiary;
    background: transparent;
    border: none;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: color $transition-fast, background-color $transition-fast;
    white-space: nowrap;
    @include focus-ring;

    &:hover {
      color: $color-text-secondary;
    }

    &--active {
      background: $color-bg-tertiary;
      color: $color-text-primary;
      box-shadow: $shadow-sm;
    }
  }

  &__filter {
    flex-shrink: 0;
  }

  &__select {
    appearance: none;
    padding: $space-2 $space-8 $space-2 $space-3;
    font-size: $text-sm;
    font-family: $font-sans;
    color: $color-text-primary;
    background: $color-bg-secondary url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right $space-3 center;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    cursor: pointer;
    transition: border-color $transition-fast;
    @include focus-ring;

    &:hover {
      border-color: $color-border-hover;
    }

    option {
      background: $color-bg-secondary;
      color: $color-text-primary;
    }
  }

  // ===== COUNT =====
  &__count {
    font-size: $text-sm;
    color: $color-text-tertiary;
    margin-bottom: $space-5;
  }

  // ===== LOADING =====
  &__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $space-4;
    padding: $space-20 0;
    color: $color-text-tertiary;
    font-size: $text-sm;
  }

  &__spinner {
    width: 36px;
    height: 36px;
    border: 3px solid $color-border;
    border-top-color: $color-primary;
    border-radius: $radius-full;
    animation: spin 0.8s linear infinite;

    &--small {
      width: 18px;
      height: 18px;
      border-width: 2px;
    }
  }

  // ===== EMPTY =====
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: $space-20 $space-6;
    color: $color-text-tertiary;

    svg {
      opacity: 0.4;
      margin-bottom: $space-4;
    }
  }

  &__empty-title {
    font-size: $text-lg;
    font-weight: $weight-semibold;
    color: $color-text-primary;
    margin-bottom: $space-2;
  }

  &__empty-text {
    font-size: $text-sm;
    color: $color-text-tertiary;
    max-width: 360px;
  }

  // ===== LOAD MORE =====
  &__load-more {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-3;
    padding-top: $space-10;
  }

  &__load-more-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: $space-2;
    min-width: 200px;
    padding: $space-3 $space-8;
    background: $color-bg-tertiary;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
    color: $color-text-primary;
    font-size: $text-sm;
    font-weight: $weight-medium;
    font-family: $font-sans;
    cursor: pointer;
    transition: border-color $transition-fast, background-color $transition-fast, box-shadow $transition-fast;
    @include focus-ring;

    &:hover:not(:disabled) {
      border-color: $color-primary;
      background: rgba($color-primary, 0.1);
      box-shadow: $shadow-glow;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__load-more-count {
    font-size: $text-xs;
    color: $color-text-tertiary;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
