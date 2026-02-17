<script setup>
import { ref, computed } from 'vue'
import { useStore } from '@nanostores/vue'
import { $followingIds, toggleFollow } from '../../stores/auth.js'
import { getFollowers } from '../../data/services/creatorService.js'
import { formatNumber } from '../../lib/formatters.js'
import BaseAvatar from '../ui/BaseAvatar.vue'

const props = defineProps({
  creatorId: { type: String, required: true },
})

const followers = ref([])
const followingIds = useStore($followingIds)

followers.value = getFollowers(props.creatorId, 20)

function isFollowing(followerId) {
  return followingIds.value.has(followerId)
}

function handleFollow(e, followerId) {
  e.preventDefault()
  e.stopPropagation()
  toggleFollow(followerId)
}

function profileUrl(handle) {
  return `/creators/${handle.replace('@', '')}`
}
</script>

<template>
  <div class="profile-followers">
    <!-- Empty state -->
    <div v-if="followers.length === 0" class="profile-followers__empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
      </svg>
      <h3 class="profile-followers__empty-title">No followers yet</h3>
      <p class="profile-followers__empty-text">This creator does not have any followers yet.</p>
    </div>

    <!-- Followers grid -->
    <div v-else class="profile-followers__grid">
      <article
        v-for="follower in followers"
        :key="follower.id"
        class="profile-followers__card"
      >
        <a :href="profileUrl(follower.handle)" class="profile-followers__link">
          <!-- Avatar -->
          <BaseAvatar
            :src="follower.avatarUrl"
            :alt="follower.displayName"
            :fallback="follower.displayName"
            size="lg"
          />

          <!-- Info -->
          <div class="profile-followers__info">
            <h3 class="profile-followers__name">{{ follower.displayName }}</h3>
            <span class="profile-followers__handle">{{ follower.handle }}</span>
            <span class="profile-followers__stat">
              {{ formatNumber(follower.workflowCount) }} workflows
            </span>
          </div>

          <!-- Follow button -->
          <button
            class="profile-followers__follow-btn"
            :class="{ 'profile-followers__follow-btn--following': isFollowing(follower.id) }"
            @click="handleFollow($event, follower.id)"
            :aria-label="isFollowing(follower.id) ? `Unfollow ${follower.displayName}` : `Follow ${follower.displayName}`"
          >
            {{ isFollowing(follower.id) ? 'Following' : 'Follow' }}
          </button>
        </a>
      </article>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-followers {
  // ===== EMPTY =====
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: $space-20 $space-6;
    color: $color-text-tertiary;

    svg {
      opacity: 0.4;
      margin-bottom: $space-4;
    }
  }

  &__empty-title {
    font-size: $text-lg;
    font-weight: $weight-semibold;
    color: $color-text-primary;
    margin-bottom: $space-2;
  }

  &__empty-text {
    font-size: $text-sm;
    color: $color-text-tertiary;
    max-width: 360px;
  }

  // ===== GRID =====
  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $space-4;

    @include respond-below('lg') {
      grid-template-columns: repeat(2, 1fr);
    }

    @include respond-below('sm') {
      grid-template-columns: 1fr;
    }
  }

  // ===== CARD =====
  &__card {
    @include card-base;
    transition: border-color $transition-base, box-shadow $transition-base;

    &:hover {
      border-color: $color-border-hover;
      box-shadow: $shadow-lg;
    }
  }

  &__link {
    display: flex;
    align-items: center;
    gap: $space-4;
    padding: $space-4;
    text-decoration: none;

    @include respond-below('sm') {
      flex-wrap: wrap;
    }
  }

  // ===== INFO =====
  &__info {
    display: flex;
    flex-direction: column;
    gap: $space-1;
    min-width: 0;
    flex: 1;
  }

  &__name {
    font-size: $text-sm;
    font-weight: $weight-semibold;
    color: $color-text-primary;
    @include text-ellipsis;
  }

  &__handle {
    font-size: $text-xs;
    color: $color-text-tertiary;
    @include text-ellipsis;
  }

  &__stat {
    font-size: $text-xs;
    color: $color-text-tertiary;
    margin-top: $space-1;
  }

  // ===== FOLLOW BUTTON =====
  &__follow-btn {
    flex-shrink: 0;
    padding: $space-1 $space-4;
    border-radius: $radius-md;
    font-size: $text-xs;
    font-weight: $weight-medium;
    cursor: pointer;
    transition: background $transition-fast, color $transition-fast, border-color $transition-fast;
    white-space: nowrap;

    // Default: not following
    background: transparent;
    color: $color-text-primary;
    border: 1px solid $color-border;

    &:hover {
      border-color: $color-primary;
      color: $color-primary-light;
    }

    // Following state
    &--following {
      background: $color-primary;
      color: white;
      border-color: $color-primary;

      &:hover {
        background: $color-primary-dark;
        border-color: $color-primary-dark;
        color: white;
      }
    }
  }
}
</style>
