<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  options: { type: Array, required: true }, // [{ id, label, count? }]
  modelValue: { type: [Array, String, null], default: null },
  multiple: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const dropdownRef = ref(null)

// Count of selected items for badge
const selectedCount = computed(() => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.length
  }
  return props.modelValue ? 1 : 0
})

function toggle() {
  isOpen.value = !isOpen.value
}

function handleSelect(optionId) {
  if (props.multiple) {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const idx = current.indexOf(optionId)
    if (idx >= 0) {
      current.splice(idx, 1)
    } else {
      current.push(optionId)
    }
    emit('update:modelValue', current)
  } else {
    // Single select — toggle off if same value
    const newVal = props.modelValue === optionId ? null : optionId
    emit('update:modelValue', newVal)
    isOpen.value = false
  }
}

function isSelected(optionId) {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.includes(optionId)
  }
  return props.modelValue === optionId
}

function clear() {
  if (props.multiple) {
    emit('update:modelValue', [])
  } else {
    emit('update:modelValue', null)
  }
}

// Close on outside click
function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="dropdown" :class="{ 'dropdown--open': isOpen }">
    <!-- Trigger button -->
    <button class="dropdown__trigger" @click="toggle">
      <span class="dropdown__label">{{ label }}</span>
      <span v-if="selectedCount > 0" class="dropdown__badge">{{ selectedCount }}</span>
      <svg class="dropdown__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <!-- Dropdown panel -->
    <Transition name="dropdown-fade">
      <div v-if="isOpen" class="dropdown__panel">
        <div v-if="selectedCount > 0" class="dropdown__clear">
          <button class="dropdown__clear-btn" @click="clear">Clear all</button>
        </div>
        <ul class="dropdown__list">
          <li
            v-for="opt in options"
            :key="opt.id"
            class="dropdown__item"
            :class="{ 'dropdown__item--selected': isSelected(opt.id) }"
            @click="handleSelect(opt.id)"
          >
            <span class="dropdown__check">
              <svg v-if="isSelected(opt.id)" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7L6 10L11 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="dropdown__item-label">{{ opt.label }}</span>
            <span v-if="opt.count != null" class="dropdown__item-count">{{ opt.count }}</span>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.dropdown {
  position: relative;

  &__trigger {
    display: inline-flex;
    align-items: center;
    gap: $space-2;
    padding: $space-1 $space-3;
    font-size: $text-sm;
    font-weight: $weight-medium;
    color: $color-text-secondary;
    background: transparent;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    cursor: pointer;
    transition: color $transition-fast, border-color $transition-fast, background $transition-fast;
    white-space: nowrap;

    &:hover {
      color: $color-text-primary;
      border-color: $color-border-hover;
    }
  }

  &--open &__trigger {
    color: $color-text-primary;
    border-color: $color-border-hover;
    background: $color-bg-tertiary;
  }

  &__label {
    line-height: 1.4;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    font-size: 11px;
    font-weight: $weight-bold;
    color: $color-bg-primary;
    background: $color-primary;
    border-radius: $radius-full;
    line-height: 1;
  }

  &__chevron {
    transition: transform $transition-fast;
    flex-shrink: 0;
  }

  &--open &__chevron {
    transform: rotate(180deg);
  }

  // Panel
  &__panel {
    position: absolute;
    top: calc(100% + $space-2);
    right: 0;
    min-width: 220px;
    max-height: 320px;
    display: flex;
    flex-direction: column;
    @include glass;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
    box-shadow: $shadow-xl;
    z-index: $z-dropdown;
    overflow: hidden;
  }

  &__clear {
    padding: $space-2 $space-3;
    border-bottom: 1px solid $color-border;
    display: flex;
    justify-content: flex-end;
  }

  &__clear-btn {
    font-size: $text-xs;
    color: $color-text-tertiary;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;

    &:hover {
      color: $color-text-primary;
    }
  }

  &__list {
    list-style: none;
    margin: 0;
    padding: $space-1 0;
    overflow-y: auto;
    @include custom-scrollbar;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: $space-2;
    padding: $space-2 $space-3;
    font-size: $text-sm;
    color: $color-text-secondary;
    cursor: pointer;
    transition: background $transition-fast, color $transition-fast;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
      color: $color-text-primary;
    }

    &--selected {
      color: $color-text-primary;
    }
  }

  &__check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    color: $color-primary;
    transition: border-color $transition-fast;
  }

  &__item--selected &__check {
    border-color: $color-primary;
    background: rgba(240, 255, 65, 0.1);
  }

  &__item-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__item-count {
    font-size: $text-xs;
    color: $color-text-tertiary;
    flex-shrink: 0;
  }
}

// Transition
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
