<script setup>
import { useStore } from '@nanostores/vue'
import { $toasts, dismissToast } from '../../stores/ui'

const toasts = useStore($toasts)
</script>

<template>
  <div class="toast-container" aria-live="polite">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast--${toast.type}`]"
        role="alert"
      >
        <div class="toast__icon">
          <!-- Success: checkmark -->
          <svg
            v-if="toast.type === 'success'"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12l3 3 5-5" />
          </svg>

          <!-- Error: X-circle -->
          <svg
            v-else-if="toast.type === 'error'"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>

          <!-- Warning: triangle -->
          <svg
            v-else-if="toast.type === 'warning'"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>

          <!-- Info: info-circle -->
          <svg
            v-else
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>

        <span class="toast__message">{{ toast.message }}</span>

        <button
          class="toast__close"
          aria-label="Dismiss notification"
          @click="dismissToast(toast.id)"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style lang="scss" scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: $z-toast;
  display: flex;
  flex-direction: column;
  gap: $space-3;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: $space-3;
  min-width: 320px;
  max-width: 420px;
  padding: $space-3 $space-4;
  background: $color-bg-card;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  box-shadow: $shadow-lg;
  pointer-events: auto;

  &--success {
    border-left: 3px solid $color-success;
  }

  &--error {
    border-left: 3px solid $color-error;
  }

  &--warning {
    border-left: 3px solid $color-warning;
  }

  &--info {
    border-left: 3px solid $color-info;
  }

  &__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &--success &__icon {
    color: $color-success;
  }

  &--error &__icon {
    color: $color-error;
  }

  &--warning &__icon {
    color: $color-warning;
  }

  &--info &__icon {
    color: $color-info;
  }

  &__message {
    flex: 1;
    font-size: $text-sm;
    color: $color-text-primary;
    line-height: $leading-normal;
  }

  &__close {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $space-1;
    color: $color-text-secondary;
    border-radius: $radius-sm;
    transition: color $transition-fast, background-color $transition-fast;
    cursor: pointer;

    &:hover {
      color: $color-text-primary;
      background: $color-bg-hover;
    }
  }
}

// TransitionGroup animations
.toast-enter-active,
.toast-leave-active {
  transition: transform 300ms ease, opacity 300ms ease;
}

.toast-enter-from {
  transform: translateY(16px);
  opacity: 0;
}

.toast-leave-to {
  transform: translateY(16px);
  opacity: 0;
}

.toast-move {
  transition: transform 300ms ease;
}
</style>
