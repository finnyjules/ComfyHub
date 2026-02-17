<script setup>
import { ref, reactive, watch, onMounted, nextTick, computed } from 'vue'
import { useDebounce } from '../../composables/useDebounce.js'
import { useScrollAnimation } from '../../composables/useScrollAnimation.js'
import { useBreakpoint } from '../../composables/useBreakpoint.js'
import { searchWorkflows, getFilterCounts } from '../../data/services/workflowService.js'
import { categories, baseModels } from '../../data/mock/generators/categories.js'

import SearchResultsHeader from './SearchResultsHeader.vue'
import SearchFilterSidebar from './SearchFilterSidebar.vue'
import SearchActiveFilters from './SearchActiveFilters.vue'
import WorkflowGrid from '../workflow/WorkflowGrid.vue'
import WorkflowCard from '../workflow/WorkflowCard.vue'

const props = defineProps({
  initialCategory: { type: String, default: '' },
  categoryLabel: { type: String, default: '' },
})

// Breakpoint
const { isMobile } = useBreakpoint()

// Search state
const query = ref('')
const filters = ref({
  category: [],
  model: [],
  difficulty: null,
  outputType: [],
  technique: [],
})
const sort = ref('relevance')
const viewMode = ref('grid')
const page = ref(1)

// Results state
const results = ref([])
const total = ref(0)
const totalPages = ref(0)
const filterCounts = ref({})
const isLoading = ref(false)
const isLoadingMore = ref(false)

// Mobile filter panel
const showMobileFilters = ref(false)

// Animation
const containerRef = ref(null)
const { revealOnScroll } = useScrollAnimation()

// Debounced query for watchers
const debouncedQuery = useDebounce(query, 300)

// Read URL params on mount
function readUrlParams() {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)

  if (params.has('q')) query.value = params.get('q')
  if (params.has('sort')) sort.value = params.get('sort')
  if (params.has('view')) viewMode.value = params.get('view')

  if (params.has('category')) {
    filters.value.category = params.get('category').split(',').filter(Boolean)
  }
  if (params.has('model')) {
    filters.value.model = params.get('model').split(',').filter(Boolean)
  }
  if (params.has('difficulty')) {
    filters.value.difficulty = params.get('difficulty')
  }
}

// Update URL to reflect current state
function updateUrl() {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams()

  if (query.value) params.set('q', query.value)
  if (filters.value.category.length) params.set('category', filters.value.category.join(','))
  if (filters.value.model.length) params.set('model', filters.value.model.join(','))
  if (filters.value.difficulty) params.set('difficulty', filters.value.difficulty)
  if (filters.value.outputType?.length) params.set('outputType', filters.value.outputType.join(','))
  if (sort.value !== 'relevance') params.set('sort', sort.value)
  if (viewMode.value !== 'grid') params.set('view', viewMode.value)

  const qs = params.toString()
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname
  window.history.replaceState({}, '', url)
}

// Perform search
async function performSearch(append = false) {
  if (!append) {
    isLoading.value = true
  } else {
    isLoadingMore.value = true
  }

  try {
    const result = searchWorkflows(query.value, filters.value, {
      page: page.value,
      limit: 24,
      sort: sort.value,
    })

    if (append) {
      results.value = [...results.value, ...result.data]
    } else {
      results.value = result.data
    }

    total.value = result.total
    totalPages.value = result.totalPages
    filterCounts.value = getFilterCounts()
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

// Load more
function loadMore() {
  if (page.value < totalPages.value) {
    page.value++
    performSearch(true)
  }
}

// Handle filter updates from sidebar
function handleFiltersUpdate(newFilters) {
  filters.value = { ...newFilters }
}

// Handle removing a single filter from active filters
function handleRemoveFilter(type, value) {
  const updated = { ...filters.value }
  if (type === 'difficulty') {
    updated.difficulty = null
  } else if (Array.isArray(updated[type])) {
    updated[type] = updated[type].filter((v) => v !== value)
  }
  filters.value = updated
}

// Handle clear all filters
function handleClearAll() {
  filters.value = {
    category: [],
    model: [],
    difficulty: null,
    outputType: [],
    technique: [],
  }
}

// Can load more
const canLoadMore = computed(() => page.value < totalPages.value)

// Page title
const pageTitle = computed(() => {
  if (props.categoryLabel) return props.categoryLabel
  if (query.value) return `Search: ${query.value}`
  return 'Browse Workflows'
})

// Watch for changes to trigger new search (debounced query)
watch(debouncedQuery, () => {
  page.value = 1
  performSearch()
  updateUrl()
})

// Watch filters deep
watch(
  () => filters.value,
  () => {
    page.value = 1
    performSearch()
    updateUrl()
  },
  { deep: true }
)

// Watch sort
watch(sort, () => {
  page.value = 1
  performSearch()
  updateUrl()
})

// Watch view mode
watch(viewMode, () => {
  updateUrl()
})

// Mount
onMounted(() => {
  readUrlParams()

  // If initialCategory prop provided, pre-set it
  if (props.initialCategory && !filters.value.category.includes(props.initialCategory)) {
    filters.value.category = [props.initialCategory]
  }

  performSearch()

  nextTick(() => {
    if (containerRef.value) {
      revealOnScroll(containerRef.value, { y: 20 })
    }
  })
})
</script>

<template>
  <section class="search-island" ref="containerRef">
    <div class="search-island__container">
      <!-- Page header -->
      <div class="search-island__header">
        <h1 class="search-island__title">{{ pageTitle }}</h1>
        <p v-if="categoryLabel" class="search-island__subtitle">
          Browse {{ categoryLabel }} workflows from the community
        </p>
      </div>

      <!-- Mobile filter toggle -->
      <button
        v-if="isMobile"
        class="search-island__filter-toggle"
        @click="showMobileFilters = !showMobileFilters"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
        <span>Filters</span>
        <span v-if="filters.category.length || filters.model.length || filters.difficulty || filters.outputType.length" class="search-island__filter-badge">
          {{ filters.category.length + filters.model.length + (filters.difficulty ? 1 : 0) + filters.outputType.length }}
        </span>
      </button>

      <div class="search-island__layout">
        <!-- Sidebar -->
        <div
          class="search-island__sidebar"
          :class="{ 'search-island__sidebar--open': showMobileFilters }"
        >
          <!-- Mobile overlay backdrop -->
          <div
            v-if="isMobile && showMobileFilters"
            class="search-island__sidebar-overlay"
            @click="showMobileFilters = false"
          />
          <div class="search-island__sidebar-inner">
            <div v-if="isMobile" class="search-island__sidebar-header">
              <h3>Filters</h3>
              <button
                class="search-island__sidebar-close"
                aria-label="Close filters"
                @click="showMobileFilters = false"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <SearchFilterSidebar
              :filters="filters"
              :filter-counts="filterCounts"
              :categories="categories"
              :base-models="baseModels"
              @update:filters="handleFiltersUpdate"
            />
          </div>
        </div>

        <!-- Main content -->
        <div class="search-island__main">
          <!-- Results header -->
          <SearchResultsHeader
            :total="total"
            :query="query"
            :sort="sort"
            :view-mode="viewMode"
            @update:sort="sort = $event"
            @update:view-mode="viewMode = $event"
          />

          <!-- Active filters -->
          <SearchActiveFilters
            :filters="filters"
            :query="query"
            @remove-filter="handleRemoveFilter"
            @clear-all="handleClearAll"
          />

          <!-- Loading state -->
          <div v-if="isLoading" class="search-island__loading">
            <div class="search-island__spinner" />
            <p>Searching workflows...</p>
          </div>

          <!-- Empty state -->
          <div v-else-if="results.length === 0" class="search-island__empty">
            <svg class="search-island__empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <h3 class="search-island__empty-title">No workflows found</h3>
            <p class="search-island__empty-text">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button class="search-island__empty-btn" @click="handleClearAll(); query = ''">
              Clear all filters
            </button>
          </div>

          <!-- Results: Grid view -->
          <WorkflowGrid
            v-else-if="viewMode === 'grid'"
            :workflows="results"
            variant="compact"
          />

          <!-- Results: List view -->
          <div v-else class="search-island__list">
            <WorkflowCard
              v-for="workflow in results"
              :key="workflow.id"
              :workflow="workflow"
              variant="expanded"
            />
          </div>

          <!-- Load more -->
          <div v-if="canLoadMore && !isLoading" class="search-island__load-more">
            <button
              class="search-island__load-more-btn"
              :disabled="isLoadingMore"
              @click="loadMore"
            >
              <span v-if="isLoadingMore" class="search-island__spinner search-island__spinner--small" />
              <span v-else>Load more workflows</span>
            </button>
            <p class="search-island__load-more-count">
              Showing {{ results.length }} of {{ total }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.search-island {
  @include section-spacing;
  min-height: 60vh;

  &__container {
    @include container;
  }

  &__header {
    margin-bottom: $space-8;
  }

  &__title {
    @include heading($text-3xl);
    margin-bottom: $space-2;

    @include respond-below('md') {
      font-size: $text-2xl;
    }
  }

  &__subtitle {
    font-size: $text-lg;
    color: $color-text-secondary;

    @include respond-below('md') {
      font-size: $text-base;
    }
  }

  // Mobile filter toggle
  &__filter-toggle {
    display: none;
    align-items: center;
    gap: $space-2;
    padding: $space-2 $space-4;
    background: $color-bg-tertiary;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    color: $color-text-primary;
    font-size: $text-sm;
    font-family: $font-sans;
    cursor: pointer;
    margin-bottom: $space-4;
    transition: border-color $transition-fast;

    @include respond-below('lg') {
      display: inline-flex;
    }

    &:hover {
      border-color: $color-border-hover;
    }
  }

  &__filter-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 $space-1;
    background: $color-primary;
    color: white;
    font-size: $text-xs;
    font-weight: $weight-semibold;
    border-radius: $radius-full;
  }

  // Layout
  &__layout {
    display: flex;
    gap: $space-8;
    align-items: flex-start;

    @include respond-below('lg') {
      flex-direction: column;
    }
  }

  // Sidebar
  &__sidebar {
    flex-shrink: 0;

    @include respond-below('lg') {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: $z-overlay;
      pointer-events: none;
      opacity: 0;
      transition: opacity $transition-base;

      &--open {
        pointer-events: all;
        opacity: 1;
      }
    }
  }

  &__sidebar-overlay {
    position: absolute;
    inset: 0;
    background: $color-bg-overlay;
  }

  &__sidebar-inner {
    position: relative;

    @include respond-below('lg') {
      position: absolute;
      top: 0;
      left: 0;
      width: 320px;
      max-width: 85vw;
      height: 100%;
      background: $color-bg-primary;
      border-right: 1px solid $color-border;
      padding: $space-6;
      overflow-y: auto;
      transform: translateX(-100%);
      transition: transform $transition-base;
      @include custom-scrollbar;

      .search-island__sidebar--open & {
        transform: translateX(0);
      }
    }
  }

  &__sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-4;
    padding-bottom: $space-4;
    border-bottom: 1px solid $color-border;

    h3 {
      font-size: $text-lg;
      font-weight: $weight-semibold;
      color: $color-text-primary;
    }
  }

  &__sidebar-close {
    display: flex;
    padding: $space-1;
    color: $color-text-tertiary;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: $radius-sm;
    transition: color $transition-fast;

    &:hover {
      color: $color-text-primary;
    }
  }

  // Main content
  &__main {
    flex: 1;
    min-width: 0;
  }

  // List view
  &__list {
    display: flex;
    flex-direction: column;
    gap: $space-4;
  }

  // Loading
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

  // Empty state
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: $space-20 $space-6;
  }

  &__empty-icon {
    color: $color-text-tertiary;
    margin-bottom: $space-4;
    opacity: 0.5;
  }

  &__empty-title {
    font-size: $text-xl;
    font-weight: $weight-semibold;
    color: $color-text-primary;
    margin-bottom: $space-2;
  }

  &__empty-text {
    font-size: $text-sm;
    color: $color-text-tertiary;
    max-width: 400px;
    margin-bottom: $space-6;
  }

  &__empty-btn {
    padding: $space-2 $space-6;
    background: $color-bg-tertiary;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    color: $color-text-primary;
    font-size: $text-sm;
    font-family: $font-sans;
    cursor: pointer;
    transition: border-color $transition-fast, background-color $transition-fast;

    @include focus-ring;

    &:hover {
      border-color: $color-border-hover;
      background: $color-bg-hover;
    }
  }

  // Load more
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
