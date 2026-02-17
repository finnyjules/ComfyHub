<script setup>
defineProps({
  label: { type: String, required: true },
  href: { type: String, default: null },
  variant: { type: String, default: 'default' }, // default, primary, success, warning
  removable: { type: Boolean, default: false },
})

defineEmits(['remove'])
</script>

<template>
  <component
    :is="href ? 'a' : 'span'"
    :href="href"
    class="tag"
    :class="`tag--${variant}`"
  >
    <span class="tag__label">{{ label }}</span>
    <button
      v-if="removable"
      class="tag__remove"
      aria-label="Remove tag"
      @click.prevent.stop="$emit('remove')"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </component>
</template>

<style lang="scss" scoped>
.tag {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  padding: $space-1 $space-3;
  font-size: $text-xs;
  font-weight: $weight-medium;
  border-radius: $radius-full;
  transition: all $transition-fast;
  white-space: nowrap;

  &--default {
    background: $color-bg-tertiary;
    color: $color-text-secondary;
    border: 1px solid $color-border;

    &:hover {
      color: $color-text-primary;
      border-color: $color-border-hover;
    }
  }

  &--primary {
    background: rgba($color-primary, 0.15);
    color: $color-primary-light;
    border: 1px solid rgba($color-primary, 0.3);
  }

  &--success {
    background: rgba($color-success, 0.15);
    color: $color-success;
    border: 1px solid rgba($color-success, 0.3);
  }

  &--warning {
    background: rgba($color-accent, 0.15);
    color: $color-accent;
    border: 1px solid rgba($color-accent, 0.3);
  }

  &__remove {
    display: flex;
    color: inherit;
    opacity: 0.6;
    border-radius: $radius-full;
    padding: 1px;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
