<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary, secondary, ghost, icon
  size: { type: String, default: 'md' }, // sm, md, lg
  href: { type: String, default: null },
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :disabled="disabled"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`]"
  >
    <slot />
  </component>
</template>

<style lang="scss" scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  font-weight: $weight-medium;
  border-radius: $radius-md;
  transition: all $transition-fast;
  white-space: nowrap;
  @include focus-ring;

  &--sm {
    padding: $space-1 $space-3;
    font-size: $text-xs;
  }

  &--md {
    padding: $space-2 $space-4;
    font-size: $text-sm;
  }

  &--lg {
    padding: $space-3 $space-6;
    font-size: $text-base;
  }

  &--primary {
    background: $color-primary;
    color: white;

    &:hover:not(:disabled) {
      background: $color-primary-dark;
    }
  }

  &--secondary {
    background: transparent;
    color: $color-text-primary;
    border: 1px solid $color-border;

    &:hover:not(:disabled) {
      border-color: $color-border-hover;
      background: $color-bg-hover;
    }
  }

  &--ghost {
    background: transparent;
    color: $color-text-secondary;

    &:hover:not(:disabled) {
      color: $color-text-primary;
      background: $color-bg-hover;
    }
  }

  &--icon {
    padding: $space-2;
    background: transparent;
    color: $color-text-secondary;
    border-radius: $radius-md;

    &:hover:not(:disabled) {
      color: $color-text-primary;
      background: $color-bg-hover;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
