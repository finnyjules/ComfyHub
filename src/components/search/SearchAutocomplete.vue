<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { getAutocomplete } from '../../data/services/workflowService.js'

const props = defineProps({
  query: { type: String, default: '' },
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(['select', 'close'])

const results = ref(null)
const activeIndex = ref(-1)
let debounceTimer = null

// Flat list of all navigable items for keyboard nav
const flatItems = computed(() => {
  if (!results.value) return []
  const items = []

  if (results.value.workflows?.length) {
    results.value.workflows.forEach((w) => {
      items.push({ type: 'workflow', data: w, href: `/workflow/${w.slug}` })
    })
  }
  if (results.value.categories?.length) {
    results.value.categories.forEach((c) => {
      items.push({ type: 'category', data: c, href: `/workflows/${c.id}` })
    })
  }
  if (results.value.tags?.length) {
    results.value.tags.forEach((t) => {
      items.push({ type: 'tag', data: t, href: `/search?q=${encodeURIComponent(t)}` })
    })
  }
  if (results.value.creators?.length) {
    results.value.creators.forEach((c) => {
      items.push({ type: 'creator', data: c, href: `/creators/${c.handle.replace('@', '')}` })
    })
  }
  if (results.value.models?.length) {
    results.value.models.forEach((m) => {
      items.push({ type: 'model', data: m, href: `/search?q=${encodeURIComponent(m)}` })
    })
  }

  return items
})

const hasResults = computed(() => flatItems.value.length > 0)

watch(() => props.query, (newQuery) => {
  clearTimeout(debounceTimer)
  if (!newQuery || newQuery.length < 2) {
    results.value = null
    activeIndex.value = -1
    return
  }
  debounceTimer = setTimeout(() => {
    results.value = getAutocomplete(newQuery)
    activeIndex.value = -1
  }, 200)
})

function handleKeydown(e) {
  if (!props.visible || !hasResults.value) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, flatItems.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, -1)
  } else if (e.key === 'Enter' && activeIndex.value >= 0) {
    e.preventDefault()
    selectItem(flatItems.value[activeIndex.value])
  } else if (e.key === 'Escape') {
    emit('close')
  }
}

function selectItem(item) {
  emit('select', item)
  window.location.href = item.href
}

function getItemIndex(type, idx) {
  // Calculate flat index for a given group item
  let offset = 0
  const order = ['workflow', 'category', 'tag', 'creator', 'model']
  const groups = {
    workflow: results.value?.workflows || [],
    category: results.value?.categories || [],
    tag: results.value?.tags || [],
    creator: results.value?.creators || [],
    model: results.value?.models || [],
  }
  for (const key of order) {
    if (key === type) return offset + idx
    offset += groups[key].length
  }
  return -1
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  clearTimeout(debounceTimer)
})

defineExpose({ handleKeydown })
</script>

<template>
  <div
    v-if="visible && hasResults"
    class="autocomplete"
    role="listbox"
    aria-label="Search suggestions"
  >
    <!-- Workflows -->
    <div v-if="results.workflows?.length" class="autocomplete__group">
      <div class="autocomplete__group-label">Workflows</div>
      <a
        v-for="(w, i) in results.workflows"
        :key="`w-${w.id}`"
        :href="`/workflow/${w.slug}`"
        class="autocomplete__item autocomplete__item--workflow"
        :class="{ 'autocomplete__item--active': activeIndex === getItemIndex('workflow', i) }"
        role="option"
        :aria-selected="activeIndex === getItemIndex('workflow', i)"
        @mouseenter="activeIndex = getItemIndex('workflow', i)"
        @click.prevent="selectItem({ type: 'workflow', data: w, href: `/workflow/${w.slug}` })"
      >
        <img
          v-if="w.thumbnailUrl"
          :src="w.thumbnailUrl"
          :alt="w.title"
          class="autocomplete__thumb"
        />
        <div class="autocomplete__item-info">
          <span class="autocomplete__item-title">{{ w.title }}</span>
          <span class="autocomplete__item-meta">by {{ w.creator }}</span>
        </div>
      </a>
    </div>

    <!-- Categories -->
    <div v-if="results.categories?.length" class="autocomplete__group">
      <div class="autocomplete__group-label">Categories</div>
      <a
        v-for="(c, i) in results.categories"
        :key="`c-${c.id}`"
        :href="`/workflows/${c.id}`"
        class="autocomplete__item"
        :class="{ 'autocomplete__item--active': activeIndex === getItemIndex('category', i) }"
        role="option"
        :aria-selected="activeIndex === getItemIndex('category', i)"
        @mouseenter="activeIndex = getItemIndex('category', i)"
        @click.prevent="selectItem({ type: 'category', data: c, href: `/workflows/${c.id}` })"
      >
        <svg class="autocomplete__item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
        </svg>
        <span class="autocomplete__item-title">{{ c.label }}</span>
      </a>
    </div>

    <!-- Tags -->
    <div v-if="results.tags?.length" class="autocomplete__group">
      <div class="autocomplete__group-label">Tags</div>
      <a
        v-for="(tag, i) in results.tags"
        :key="`t-${tag}`"
        :href="`/search?q=${encodeURIComponent(tag)}`"
        class="autocomplete__item"
        :class="{ 'autocomplete__item--active': activeIndex === getItemIndex('tag', i) }"
        role="option"
        :aria-selected="activeIndex === getItemIndex('tag', i)"
        @mouseenter="activeIndex = getItemIndex('tag', i)"
        @click.prevent="selectItem({ type: 'tag', data: tag, href: `/search?q=${encodeURIComponent(tag)}` })"
      >
        <svg class="autocomplete__item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
        <span class="autocomplete__item-title">{{ tag }}</span>
      </a>
    </div>

    <!-- Creators -->
    <div v-if="results.creators?.length" class="autocomplete__group">
      <div class="autocomplete__group-label">Creators</div>
      <a
        v-for="(creator, i) in results.creators"
        :key="`cr-${creator.id}`"
        :href="`/creators/${creator.handle.replace('@', '')}`"
        class="autocomplete__item"
        :class="{ 'autocomplete__item--active': activeIndex === getItemIndex('creator', i) }"
        role="option"
        :aria-selected="activeIndex === getItemIndex('creator', i)"
        @mouseenter="activeIndex = getItemIndex('creator', i)"
        @click.prevent="selectItem({ type: 'creator', data: creator, href: `/creators/${creator.handle.replace('@', '')}` })"
      >
        <img
          v-if="creator.avatarUrl"
          :src="creator.avatarUrl"
          :alt="creator.displayName"
          class="autocomplete__avatar"
        />
        <div class="autocomplete__item-info">
          <span class="autocomplete__item-title">{{ creator.displayName }}</span>
          <span class="autocomplete__item-meta">@{{ creator.handle }}</span>
        </div>
      </a>
    </div>

    <!-- Models -->
    <div v-if="results.models?.length" class="autocomplete__group">
      <div class="autocomplete__group-label">Models</div>
      <a
        v-for="(model, i) in results.models"
        :key="`m-${model}`"
        :href="`/search?q=${encodeURIComponent(model)}`"
        class="autocomplete__item"
        :class="{ 'autocomplete__item--active': activeIndex === getItemIndex('model', i) }"
        role="option"
        :aria-selected="activeIndex === getItemIndex('model', i)"
        @mouseenter="activeIndex = getItemIndex('model', i)"
        @click.prevent="selectItem({ type: 'model', data: model, href: `/search?q=${encodeURIComponent(model)}` })"
      >
        <svg class="autocomplete__item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
        <span class="autocomplete__item-title">{{ model }}</span>
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.autocomplete {
  position: absolute;
  top: calc(100% + $space-1);
  left: 0;
  right: 0;
  background: $color-bg-secondary;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  box-shadow: $shadow-xl;
  z-index: $z-dropdown;
  max-height: 420px;
  overflow-y: auto;
  @include custom-scrollbar;

  &__group {
    padding: $space-2 0;

    &:not(:last-child) {
      border-bottom: 1px solid $color-border;
    }
  }

  &__group-label {
    padding: $space-1 $space-4;
    font-size: $text-xs;
    font-weight: $weight-semibold;
    color: $color-text-tertiary;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: $space-3;
    padding: $space-2 $space-4;
    cursor: pointer;
    text-decoration: none;
    transition: background-color $transition-fast;

    &:hover,
    &--active {
      background: $color-bg-hover;
    }
  }

  &__thumb {
    width: 40px;
    height: 30px;
    object-fit: cover;
    border-radius: $radius-sm;
    flex-shrink: 0;
  }

  &__avatar {
    width: 28px;
    height: 28px;
    border-radius: $radius-full;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__item-icon {
    flex-shrink: 0;
    color: $color-text-tertiary;
  }

  &__item-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  &__item-title {
    font-size: $text-sm;
    color: $color-text-primary;
    @include text-ellipsis;
  }

  &__item-meta {
    font-size: $text-xs;
    color: $color-text-tertiary;
  }
}
</style>
