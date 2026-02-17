<script setup>
import { getRelated } from '../../data/services/workflowService.js'
import { getCreatorById } from '../../data/services/creatorService.js'
import WorkflowCard from '../workflow/WorkflowCard.vue'

const props = defineProps({
  workflowId: { type: String, required: true },
  category: { type: String, required: true },
  creatorId: { type: String, required: true },
})

const { similar, byCreator } = getRelated(props.workflowId, props.category, props.creatorId, 4)
const creator = getCreatorById(props.creatorId)
</script>

<template>
  <div class="related">
    <!-- More from @creator -->
    <section v-if="byCreator.length" class="related__section">
      <div class="related__header">
        <img
          v-if="creator"
          :src="creator.avatarUrl"
          :alt="creator.displayName"
          class="related__avatar"
        />
        <h2 class="related__heading">
          More from {{ creator ? `@${creator.handle.replace('@', '')}` : 'this creator' }}
        </h2>
      </div>
      <div class="related__grid">
        <WorkflowCard
          v-for="w in byCreator"
          :key="w.id"
          :workflow="w"
          variant="compact"
        />
      </div>
    </section>

    <!-- Similar workflows -->
    <section v-if="similar.length" class="related__section">
      <h2 class="related__heading">Similar workflows</h2>
      <div class="related__grid">
        <WorkflowCard
          v-for="w in similar"
          :key="w.id"
          :workflow="w"
          variant="compact"
        />
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.related {
  display: flex;
  flex-direction: column;
  gap: $space-16;

  &__section {
    display: flex;
    flex-direction: column;
    gap: $space-6;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: $space-3;
  }

  &__avatar {
    width: 24px;
    height: 24px;
    border-radius: $radius-full;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__heading {
    font-size: $text-2xl;
    font-weight: $weight-semibold;
    color: $color-text-primary;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $space-8;

    @include respond-below('xl') {
      grid-template-columns: repeat(3, 1fr);
    }

    @include respond-below('lg') {
      grid-template-columns: repeat(2, 1fr);
    }

    @include respond-below('sm') {
      grid-template-columns: 1fr;
    }
  }
}
</style>
