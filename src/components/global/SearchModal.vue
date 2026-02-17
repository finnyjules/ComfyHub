<script setup>
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useStore } from '@nanostores/vue'
import { $searchModalOpen } from '../../stores/ui'
import { getWorkflows, getByCategory } from '../../data/services/workflowService.js'
import { categories } from '../../data/mock/generators/categories.js'
import WorkflowGrid from '../workflow/WorkflowGrid.vue'
import AppSearchBar from './AppSearchBar.vue'
import BaseTabGroup from '../ui/BaseTabGroup.vue'

const isOpen = useStore($searchModalOpen)
const modalRef = ref(null)

// Category filter state
const activeCategory = ref('all')
const allCategories = [
  { id: 'all', label: 'All' },
  ...categories.map((c) => ({ id: c.id, label: c.label })),
]

// Sort state
const activeSort = ref('popular')
const sortTabs = [
  { id: 'popular', label: 'Popular' },
  { id: 'trending', label: 'Trending' },
  { id: 'newest', label: 'Newest' },
]

// Pagination
const ITEMS_PER_PAGE = 24
const page = ref(1)
const allResults = ref([])
const total = ref(0)

function fetchData() {
  try {
    let result
    if (activeCategory.value === 'all') {
      result = getWorkflows({ page: 1, limit: 9999, sort: activeSort.value })
    } else {
      result = getByCategory(activeCategory.value, { page: 1, limit: 9999, sort: activeSort.value })
    }
    allResults.value = result.data
    total.value = result.total
  } catch (err) {
    console.error('[SearchModal] fetchData failed:', err)
    allResults.value = []
    total.value = 0
  }
}

const displayedWorkflows = computed(() => {
  return allResults.value.slice(0, page.value * ITEMS_PER_PAGE)
})

const canLoadMore = computed(() => {
  return displayedWorkflows.value.length < total.value
})

function loadMore() {
  page.value++
}

function setCategory(catId) {
  activeCategory.value = catId
  page.value = 1
  fetchData()
}

watch(activeSort, () => {
  page.value = 1
  fetchData()
})

// Close modal
function close() {
  $searchModalOpen.set(false)
}

// Lock body scroll and focus search input when opening
watch(isOpen, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
    // Fetch data if not loaded yet
    if (allResults.value.length === 0) {
      fetchData()
    }
    // Focus search input after render
    nextTick(() => {
      const input = modalRef.value?.querySelector('.search-bar__input')
      if (input) input.focus()
    })
  } else {
    document.body.style.overflow = ''
  }
})

// Escape key to close
function handleKeydown(e) {
  if (e.key === 'Escape' && isOpen.value) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" ref="modalRef" class="search-modal" role="dialog" aria-modal="true" aria-label="Search workflows">
        <!-- Backdrop -->
        <div class="search-modal__backdrop" @click="close" />

        <!-- Content -->
        <div class="search-modal__content">
          <!-- Header with close button -->
          <div class="search-modal__header">
            <button class="search-modal__close" aria-label="Close search" @click="close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <kbd class="search-modal__esc">ESC</kbd>
            </button>
          </div>

          <!-- Search + filters + grid (scrollable area) -->
          <div class="search-modal__body">
            <!-- Search bar -->
            <div class="search-modal__search">
              <AppSearchBar :placeholder="`Search ${total} workflows...`" />
            </div>

            <!-- Category pills -->
            <div class="search-modal__filters">
              <button
                v-for="cat in allCategories"
                :key="cat.id"
                class="search-modal__pill"
                :class="{ 'search-modal__pill--active': activeCategory === cat.id }"
                @click="setCategory(cat.id)"
              >
                {{ cat.label }}
              </button>
            </div>

            <!-- Sort tabs -->
            <div class="search-modal__sort">
              <BaseTabGroup :tabs="sortTabs" v-model="activeSort" />
            </div>

            <!-- Grid -->
            <WorkflowGrid
              :workflows="displayedWorkflows"
              variant="gallery"
              columns="3"
            />

            <!-- Load more -->
            <div v-if="canLoadMore" class="search-modal__load-more">
              <button class="search-modal__load-btn" @click="loadMore">
                Load more workflows
              </button>
              <p class="search-modal__count">
                Showing {{ displayedWorkflows.length }} of {{ total }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.search-modal {
  position: fixed;
  inset: 0;
  z-index: $z-modal;
  display: flex;
  flex-direction: column;

  &__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
  }

  &__content {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: $color-bg-primary;
    overflow: hidden;
  }

  &__header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: $space-3 $space-6;
    flex-shrink: 0;
    border-bottom: 1px solid $color-border;
  }

  &__close {
    display: flex;
    align-items: center;
    gap: $space-2;
    padding: $space-2 $space-3;
    color: $color-text-tertiary;
    background: transparent;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    cursor: pointer;
    transition: color $transition-fast, border-color $transition-fast;
    @include focus-ring;

    &:hover {
      color: $color-text-primary;
      border-color: $color-border-hover;
    }
  }

  &__esc {
    font-size: $text-xs;
    font-family: $font-sans;
    color: $color-text-tertiary;
    pointer-events: none;
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: $space-8 0 $space-20;
    @include custom-scrollbar;
  }

  // Search bar
  &__search {
    max-width: 640px;
    width: 100%;
    margin: 0 auto $space-6;
    padding: 0 $space-6;

    @include respond-below('md') {
      max-width: 100%;
    }
  }

  // Category pills
  &__filters {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: $space-2;
    margin-bottom: $space-8;
    padding: 0 $space-6;

    @include respond-below('md') {
      overflow-x: auto;
      flex-wrap: nowrap;
      justify-content: flex-start;
      padding-bottom: $space-1;
      -webkit-overflow-scrolling: touch;
      @include custom-scrollbar;
    }
  }

  &__pill {
    display: inline-flex;
    align-items: center;
    padding: $space-2 $space-4;
    font-size: $text-sm;
    font-weight: $weight-medium;
    color: $color-text-secondary;
    background: transparent;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    white-space: nowrap;
    cursor: pointer;
    transition: color $transition-fast, border-color $transition-fast, background $transition-fast;
    @include focus-ring;

    &:hover {
      color: $color-text-primary;
      border-color: $color-border-hover;
    }

    &--active {
      background: $color-text-primary;
      border-color: $color-text-primary;
      color: $color-bg-primary;

      &:hover {
        background: #fff;
        border-color: #fff;
        color: $color-bg-primary;
      }
    }
  }

  // Sort tabs
  &__sort {
    padding: 0 $space-6;
    margin-bottom: $space-6;
    @include container;
  }

  // Grid
  :deep(.workflow-grid) {
    @include container;
    gap: $space-8;
    padding: 0 $space-6;
  }

  // Load more
  &__load-more {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-3;
    margin-top: $space-10;
  }

  &__load-btn {
    padding: $space-3 $space-8;
    font-size: $text-sm;
    font-weight: $weight-semibold;
    color: $color-text-primary;
    background: $color-bg-tertiary;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    cursor: pointer;
    transition: background $transition-fast, border-color $transition-fast;
    @include focus-ring;

    &:hover {
      background: $color-bg-primary;
      border-color: $color-border-hover;
    }
  }

  &__count {
    font-size: $text-xs;
    color: $color-text-tertiary;
    margin: 0;
  }
}

// Transition
.modal-enter-active {
  transition: opacity 0.2s ease;

  .search-modal__content {
    transition: transform 0.2s ease;
  }
}

.modal-leave-active {
  transition: opacity 0.15s ease;

  .search-modal__content {
    transition: transform 0.15s ease;
  }
}

.modal-enter-from {
  opacity: 0;

  .search-modal__content {
    transform: translateY(-8px);
  }
}

.modal-leave-to {
  opacity: 0;

  .search-modal__content {
    transform: translateY(-8px);
  }
}
</style>
