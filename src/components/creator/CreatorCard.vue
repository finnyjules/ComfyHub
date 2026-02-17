<script setup>
import { computed } from 'vue'
import { useStore } from '@nanostores/vue'
import { $followingIds, toggleFollow } from '../../stores/auth.js'
import { formatNumber } from '../../lib/formatters.js'

const props = defineProps({
  creator: { type: Object, required: true },
})

const followingIds = useStore($followingIds)
const isFollowing = computed(() => followingIds.value.has(props.creator.id))

const profileUrl = computed(() => `/creators/${props.creator.handle.replace('@', '')}`)

function handleFollow(e) {
  e.preventDefault()
  e.stopPropagation()
  toggleFollow(props.creator.id)
}
</script>

<template>
  <article class="creator-card">
    <a :href="profileUrl" class="creator-card__link">
      <!-- Top section: avatar + identity -->
      <div class="creator-card__header">
        <img
          :src="creator.avatarUrl"
          :alt="creator.displayName"
          class="creator-card__avatar"
          loading="lazy"
        />
        <div class="creator-card__identity">
          <h3 class="creator-card__name">{{ creator.displayName }}</h3>
          <span class="creator-card__handle">{{ creator.handle }}</span>
        </div>
      </div>

      <!-- Badges -->
      <div v-if="creator.badges?.length" class="creator-card__badges">
        <span
          v-for="badge in creator.badges"
          :key="badge.id"
          class="creator-card__badge"
        >
          {{ badge.label }}
        </span>
      </div>

      <!-- Bio -->
      <p v-if="creator.bio" class="creator-card__bio">{{ creator.bio }}</p>

      <!-- Stats -->
      <div class="creator-card__stats">
        <span class="creator-card__stat">
          {{ formatNumber(creator.stats.workflowCount) }} workflows
        </span>
        <span class="creator-card__separator" aria-hidden="true">&middot;</span>
        <span class="creator-card__stat">
          {{ formatNumber(creator.stats.totalRuns) }} runs
        </span>
      </div>

      <!-- Follow button -->
      <button
        class="creator-card__follow-btn"
        :class="{ 'creator-card__follow-btn--following': isFollowing }"
        @click="handleFollow"
        :aria-label="isFollowing ? `Unfollow ${creator.displayName}` : `Follow ${creator.displayName}`"
      >
        {{ isFollowing ? 'Following' : 'Follow' }}
      </button>
    </a>
  </article>
</template>

<style lang="scss" scoped>
.creator-card {
  @include card-base;
  display: flex;
  flex-direction: column;
  transition: border-color $transition-base, box-shadow $transition-base;

  &:hover {
    border-color: $color-border-hover;
  }

  &__link {
    display: flex;
    flex-direction: column;
    gap: $space-3;
    padding: $space-5;
    height: 100%;
    text-decoration: none;
  }

  // Header: avatar + identity
  &__header {
    display: flex;
    align-items: center;
    gap: $space-3;
  }

  &__avatar {
    width: 48px;
    height: 48px;
    border-radius: $radius-full;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__identity {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__name {
    font-size: $text-base;
    font-weight: $weight-semibold;
    color: $color-text-primary;
    margin: 0;
    @include text-ellipsis;
  }

  &__handle {
    font-size: $text-sm;
    color: $color-text-tertiary;
    @include text-ellipsis;
  }

  // Badges
  &__badges {
    display: flex;
    flex-wrap: wrap;
    gap: $space-1;
  }

  &__badge {
    font-size: $text-xs;
    padding: 2px $space-2;
    background: $color-bg-tertiary;
    color: $color-primary-light;
    border-radius: $radius-sm;
    font-weight: $weight-medium;
  }

  // Bio
  &__bio {
    font-size: $text-sm;
    color: $color-text-secondary;
    margin: 0;
    @include line-clamp(2);
  }

  // Stats row
  &__stats {
    display: flex;
    align-items: center;
    gap: $space-2;
    margin-top: auto;
    padding-top: $space-3;
  }

  &__stat {
    font-size: $text-xs;
    color: $color-text-tertiary;
  }

  &__separator {
    font-size: $text-xs;
    color: $color-text-tertiary;
  }

  // Follow button
  &__follow-btn {
    width: 100%;
    padding: $space-2 $space-4;
    border-radius: $radius-md;
    font-size: $text-sm;
    font-weight: $weight-medium;
    cursor: pointer;
    transition: background $transition-fast, color $transition-fast, border-color $transition-fast;

    // Secondary (default / not following)
    background: transparent;
    color: $color-text-primary;
    border: 1px solid $color-border;

    &:hover {
      border-color: $color-primary;
      color: $color-primary-light;
    }

    // Primary (following)
    &--following {
      background: $color-primary;
      color: white;
      border-color: $color-primary;

      &:hover {
        background: $color-primary-dark;
        border-color: $color-primary-dark;
      }
    }
  }
}
</style>
