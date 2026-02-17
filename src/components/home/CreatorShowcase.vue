<script setup>
import { ref, onMounted } from 'vue'
import { getCreator, getCreatorWorkflows } from '../../data/services/creatorService.js'
import { useScrollAnimation } from '../../composables/useScrollAnimation.js'
import WorkflowCard from '../workflow/WorkflowCard.vue'
import BaseAvatar from '../ui/BaseAvatar.vue'

const FEATURED_HANDLES = ['hellorob', 'PurzBeats', '8bit_e']

const rows = ref([])

onMounted(() => {
  rows.value = FEATURED_HANDLES.map((handle) => {
    const creator = getCreator(handle)
    if (!creator) return null
    const { data } = getCreatorWorkflows(creator.id, { page: 1, limit: 3, sort: 'popular' })
    return { creator, workflows: data }
  }).filter(Boolean)

  // Stagger rows in on scroll
  if (sectionRef.value) {
    staggerChildren(sectionRef.value, '.creator-showcase__row', { y: 30 })
  }
})

const sectionRef = ref(null)
const { staggerChildren } = useScrollAnimation()
</script>

<template>
  <section ref="sectionRef" class="creator-showcase">
    <div class="creator-showcase__container">
      <h2 class="creator-showcase__heading">Discover the world's best creators</h2>

      <div
        v-for="row in rows"
        :key="row.creator.id"
        class="creator-showcase__row"
      >
        <!-- Creator info -->
        <div class="creator-showcase__info">
          <a
            :href="`/creators/${row.creator.handle.replace('@', '')}`"
            class="creator-showcase__avatar-link"
          >
            <BaseAvatar
              :src="row.creator.avatarUrl"
              :alt="row.creator.displayName"
              size="lg"
            />
          </a>

          <div class="creator-showcase__meta">
            <a
              :href="`/creators/${row.creator.handle.replace('@', '')}`"
              class="creator-showcase__name"
            >
              {{ row.creator.displayName }}
            </a>
            <span class="creator-showcase__handle">{{ row.creator.handle }}</span>
            <p class="creator-showcase__bio">{{ row.creator.bio }}</p>

            <a
              :href="`/creators/${row.creator.handle.replace('@', '')}`"
              class="creator-showcase__profile-link"
            >
              View profile
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Creator's workflows (3 cards) -->
        <div class="creator-showcase__workflows">
          <WorkflowCard
            v-for="wf in row.workflows"
            :key="wf.id"
            :workflow="wf"
            variant="compact"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.creator-showcase {
  padding: $space-16 0 $space-20;
  background: $color-bg-primary;

  @include respond-below('md') {
    padding: $space-10 0 $space-12;
  }

  &__container {
    @include container;
  }

  &__heading {
    font-size: clamp(1.5rem, 4vw, 2.25rem);
    font-weight: $weight-normal;
    color: $color-text-primary;
    line-height: $leading-tight;
    margin-bottom: $space-12;
    text-align: center;

    @include respond-below('md') {
      margin-bottom: $space-8;
    }
  }

  &__row {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: $space-8;
    align-items: start;
    padding: $space-8 0;

    @include respond-below('lg') {
      grid-template-columns: 1fr;
      gap: $space-6;
    }
  }

  // Creator info (left column)
  &__info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: $space-3;

    @include respond-below('lg') {
      flex-direction: row;
      gap: $space-4;
    }
  }

  &__avatar-link {
    flex-shrink: 0;
    border-radius: $radius-full;
    @include focus-ring;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: $space-1;
  }

  &__name {
    font-size: $text-lg;
    font-weight: $weight-semibold;
    color: $color-text-primary;
    text-decoration: none;
    transition: color $transition-fast;
    letter-spacing: -0.01em;

    &:hover {
      color: $color-primary-light;
    }
  }

  &__handle {
    font-size: $text-sm;
    color: $color-text-tertiary;
  }

  &__bio {
    font-size: $text-sm;
    color: $color-text-secondary;
    line-height: $leading-normal;
    margin: $space-1 0 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;

    @include respond-below('lg') {
      -webkit-line-clamp: 2;
    }
  }

  &__profile-link {
    display: inline-flex;
    align-items: center;
    gap: $space-1;
    margin-top: $space-2;
    font-size: $text-sm;
    font-weight: $weight-medium;
    color: $color-primary-light;
    text-decoration: none;
    transition: color $transition-fast, gap $transition-fast;

    &:hover {
      color: $color-primary;
      gap: $space-2;
    }
  }

  // Workflows (right column — 3 cards)
  &__workflows {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $space-4;

    @include respond-below('lg') {
      grid-template-columns: repeat(3, 1fr);
    }

    @include respond-below('md') {
      grid-template-columns: repeat(2, 1fr);
    }

    @include respond-below('sm') {
      grid-template-columns: 1fr;
    }
  }
}
</style>
