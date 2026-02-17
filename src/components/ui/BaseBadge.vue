<script setup>
defineProps({
  label: { type: String, required: true },
  variant: { type: String, default: 'default' }, // default, new, updated, difficulty
  tooltip: { type: String, default: '' },
})
</script>

<template>
  <span
    class="badge"
    :class="`badge--${variant}`"
    :title="tooltip"
  >
    {{ label }}
  </span>
</template>

<style lang="scss" scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px $space-2;
  font-size: 10px;
  font-weight: $weight-semibold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: $radius-sm;

  &--default {
    background: $color-bg-tertiary;
    color: $color-text-secondary;
  }

  &--new {
    background: rgba($color-success, 0.15);
    color: $color-success;
  }

  &--updated {
    background: rgba($color-info, 0.15);
    color: $color-info;
  }

  &--difficulty {
    background: rgba($color-accent, 0.15);
    color: $color-accent;
  }
}
</style>
