<script setup>
import { ref, computed } from 'vue'
import { useStore } from '@nanostores/vue'
import { $favoriteIds, toggleFavorite } from '../../stores/auth.js'
import { formatNumber } from '../../lib/formatters.js'
import BaseAvatar from '../ui/BaseAvatar.vue'
import BaseBadge from '../ui/BaseBadge.vue'

const props = defineProps({
  workflow: { type: Object, required: true },
  variant: { type: String, default: 'compact' }, // compact, expanded, featured, gallery
})

const favoriteIds = useStore($favoriteIds)
const isFavorited = computed(() => favoriteIds.value.has(props.workflow.id))
const isHovered = ref(false)

function handleFavorite(e) {
  e.preventDefault()
  e.stopPropagation()
  toggleFavorite(props.workflow.id)
}
</script>

<template>
  <article
    class="workflow-card"
    :class="[`workflow-card--${variant}`]"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <a :href="`/workflow/${workflow.slug}`" class="workflow-card__link">
      <!-- Thumbnail -->
      <div class="workflow-card__thumbnail-wrap">
        <img
          :src="workflow.thumbnailUrl"
          :alt="workflow.title"
          class="workflow-card__thumbnail"
          loading="lazy"
        />
        <div v-if="variant !== 'gallery'" class="workflow-card__overlay" :class="{ 'workflow-card__overlay--visible': isHovered }">
          <span class="workflow-card__run-btn">Run</span>
        </div>
        <BaseBadge
          v-if="workflow.isNew && variant !== 'gallery'"
          label="New"
          variant="new"
          class="workflow-card__badge"
        />
        <BaseBadge
          v-else-if="workflow.isUpdated && variant !== 'gallery'"
          label="Updated"
          variant="updated"
          class="workflow-card__badge"
        />
        <BaseBadge
          v-if="workflow.isStaffPick && variant !== 'gallery'"
          label="Staff Pick"
          variant="difficulty"
          class="workflow-card__badge workflow-card__badge--right"
        />
      </div>

      <!-- Info -->
      <div class="workflow-card__info">
        <div v-if="variant !== 'gallery'" class="workflow-card__category-row">
          <span class="workflow-card__category">{{ workflow.categoryLabel }}</span>
          <span v-if="variant !== 'compact'" class="workflow-card__difficulty">{{ workflow.difficulty }}</span>
        </div>

        <h3 class="workflow-card__title">{{ workflow.title }}</h3>

        <p v-if="variant === 'expanded' || variant === 'featured'" class="workflow-card__description">
          {{ workflow.shortDescription }}
        </p>

        <!-- Creator -->
        <div class="workflow-card__creator">
          <BaseAvatar :src="workflow.creator.avatarUrl" :alt="workflow.creator.displayName" size="xs" />
          <span class="workflow-card__creator-name">{{ workflow.creator.displayName }}</span>
        </div>

        <!-- Gallery tagline -->
        <div v-if="variant === 'gallery' && workflow.tags?.length" class="workflow-card__tagline">
          { {{ workflow.tags.slice(0, 3).join(', ') }} }
        </div>

        <!-- Stats -->
        <div v-if="variant !== 'gallery'" class="workflow-card__stats">
          <span class="workflow-card__stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            {{ formatNumber(workflow.stats.runs) }}
          </span>
          <button
            class="workflow-card__stat workflow-card__stat--favorite"
            :class="{ 'workflow-card__stat--favorited': isFavorited }"
            @click="handleFavorite"
            :aria-label="isFavorited ? 'Remove from favorites' : 'Add to favorites'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" :fill="isFavorited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {{ formatNumber(workflow.stats.favorites) }}
          </button>
          <span v-if="variant !== 'compact'" class="workflow-card__stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
            {{ formatNumber(workflow.stats.forks) }}
          </span>
        </div>

        <!-- Tags (featured only, not gallery) -->
        <div v-if="variant === 'featured'" class="workflow-card__tags">
          <span v-for="tag in workflow.tags.slice(0, 3)" :key="tag" class="workflow-card__tag">
            {{ tag }}
          </span>
        </div>
      </div>
    </a>
  </article>
</template>

<style lang="scss" scoped>
.workflow-card {
  @include card-base;
  display: flex;
  flex-direction: column;
  transition: transform $transition-base, box-shadow $transition-base, border-color $transition-base;

  &:hover {
    border-color: $color-border-hover;
  }

  &__link {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  // Thumbnail
  &__thumbnail-wrap {
    position: relative;
    aspect-ratio: 4/3;
    overflow: hidden;
    flex-shrink: 0;
  }

  &__thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;

    .workflow-card:hover & {
      transform: scale(1.05);
    }
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity $transition-base;

    &--visible {
      opacity: 1;
    }
  }

  &__run-btn {
    padding: $space-2 $space-6;
    background: $color-primary;
    color: white;
    font-weight: $weight-semibold;
    font-size: $text-sm;
    border-radius: $radius-md;
  }

  &__badge {
    position: absolute;
    top: $space-2;
    left: $space-2;

    &--right {
      left: auto;
      right: $space-2;
    }
  }

  // Info
  &__info {
    padding: $space-4;
    display: flex;
    flex-direction: column;
    gap: $space-2;
    flex: 1;
  }

  &__category-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-2;
  }

  &__category {
    font-size: $text-xs;
    font-weight: $weight-medium;
    color: $color-primary-light;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__difficulty {
    font-size: $text-xs;
    color: $color-text-tertiary;
  }

  &__title {
    font-size: $text-sm;
    font-weight: $weight-semibold;
    color: $color-text-primary;
    @include line-clamp(2);
  }

  &__description {
    font-size: $text-sm;
    color: $color-text-tertiary;
    @include line-clamp(2);
  }

  &__creator {
    display: flex;
    align-items: center;
    gap: $space-2;
    margin-top: auto;
  }

  &__creator-name {
    font-size: $text-xs;
    color: $color-text-secondary;
  }

  &__stats {
    display: flex;
    align-items: center;
    gap: $space-4;
    padding-top: $space-2;
    border-top: 1px solid $color-border;
  }

  &__stat {
    display: inline-flex;
    align-items: center;
    gap: $space-1;
    font-size: $text-xs;
    color: $color-text-tertiary;

    &--favorite {
      cursor: pointer;
      transition: color $transition-fast;

      &:hover {
        color: $color-error;
      }
    }

    &--favorited {
      color: $color-error;
    }
  }

  &__tags {
    display: flex;
    gap: $space-1;
    flex-wrap: wrap;
    margin-top: $space-1;
  }

  &__tag {
    font-size: 10px;
    padding: 2px $space-2;
    background: $color-bg-tertiary;
    color: $color-text-tertiary;
    border-radius: $radius-sm;
  }

  // ===== VARIANTS =====

  // Expanded (list view)
  &--expanded {
    flex-direction: row;

    .workflow-card__thumbnail-wrap {
      width: 200px;
      aspect-ratio: auto;
      min-height: 150px;
    }

    .workflow-card__info {
      padding: $space-4 $space-5;
    }

    .workflow-card__title {
      font-size: $text-base;
    }
  }

  // Gallery (minimal showcase card)
  &--gallery {
    background: transparent;
    border: none;
    border-radius: 0;

    &:hover {
      border-color: transparent;
    }

    .workflow-card__link {
      gap: 0;
    }

    .workflow-card__thumbnail-wrap {
      border-radius: $radius-lg;
      overflow: hidden;
      aspect-ratio: 16/9;
    }

    .workflow-card__thumbnail {
      .workflow-card:hover & {
        transform: scale(1.03);
      }
    }

    .workflow-card__info {
      padding: $space-3 0 0 0;
      gap: $space-1;
    }

    .workflow-card__title {
      font-size: $text-sm;
      font-weight: $weight-semibold;
      @include line-clamp(1);
    }

    .workflow-card__creator {
      margin-top: 0;
    }

    .workflow-card__creator-name {
      font-size: $text-xs;
      color: $color-text-tertiary;
    }
  }

  &__tagline {
    font-size: $text-xs;
    color: $color-text-tertiary;
  }

  // Featured (hero card)
  &--featured {
    .workflow-card__thumbnail-wrap {
      aspect-ratio: 16/9;
    }

    .workflow-card__info {
      padding: $space-5;
    }

    .workflow-card__title {
      font-size: $text-lg;
    }
  }
}
</style>
