<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import SearchAutocomplete from '../search/SearchAutocomplete.vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Search workflows...',
  },
})

const query = ref('')
const isFocused = ref(false)
const showAutocomplete = ref(false)
const inputRef = ref(null)
const wrapperRef = ref(null)

function handleSubmit() {
  if (query.value.trim()) {
    showAutocomplete.value = false
    window.location.href = `/search?q=${encodeURIComponent(query.value.trim())}`
  }
}

function handleFocus() {
  isFocused.value = true
  if (query.value.length >= 2) {
    showAutocomplete.value = true
  }
}

function handleBlur() {
  // Delay to allow click on autocomplete items
  setTimeout(() => {
    isFocused.value = false
    showAutocomplete.value = false
  }, 200)
}

function handleInput() {
  showAutocomplete.value = query.value.length >= 2
}

function handleAutocompleteSelect() {
  showAutocomplete.value = false
}

function handleAutocompleteClose() {
  showAutocomplete.value = false
}

function handleKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    inputRef.value?.focus()
  }
}

function handleClickOutside(e) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    showAutocomplete.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="wrapperRef" class="search-bar-wrapper">
    <form
      class="search-bar"
      :class="{ 'search-bar--focused': isFocused }"
      role="search"
      @submit.prevent="handleSubmit"
    >
      <svg class="search-bar__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        class="search-bar__input"
        :placeholder="placeholder"
        aria-label="Search workflows"
        aria-autocomplete="list"
        :aria-expanded="showAutocomplete"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
      />
      <kbd v-if="!isFocused && !query" class="search-bar__shortcut">
        <span>&#8984;K</span>
      </kbd>
      <button
        v-if="query"
        type="button"
        class="search-bar__clear"
        aria-label="Clear search"
        @click="query = ''; showAutocomplete = false"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </form>

    <SearchAutocomplete
      :query="query"
      :visible="showAutocomplete"
      @select="handleAutocompleteSelect"
      @close="handleAutocompleteClose"
    />
  </div>
</template>

<style lang="scss" scoped>
.search-bar-wrapper {
  position: relative;
  width: 100%;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background: $color-bg-tertiary;
  border: 1px solid $color-border;
  border-radius: $radius-xl;
  transition: border-color $transition-fast, box-shadow $transition-fast;

  &--focused {
    border-color: $color-brand-yellow;
    box-shadow: 0 0 0 1px rgba(240, 255, 65, 0.15);
  }

  &__icon {
    position: absolute;
    left: $space-4;
    color: $color-text-tertiary;
    pointer-events: none;
    flex-shrink: 0;
  }

  &__input {
    width: 100%;
    padding: $space-3 $space-5 $space-3 $space-12;
    background: none;
    border: none;
    outline: none;
    font-size: $text-base;
    color: $color-text-primary;

    &::placeholder {
      color: $color-text-tertiary;
    }
  }

  &__shortcut {
    position: absolute;
    right: $space-4;
    padding: 2px $space-2;
    font-size: $text-xs;
    font-family: $font-sans;
    color: $color-text-tertiary;
    background: $color-bg-secondary;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    pointer-events: none;
  }

  &__clear {
    position: absolute;
    right: $space-3;
    display: flex;
    padding: $space-1;
    color: $color-text-tertiary;
    border-radius: $radius-sm;
    transition: color $transition-fast;

    &:hover {
      color: $color-text-primary;
    }
  }
}
</style>
