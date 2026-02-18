<script setup>
import { ref, onMounted } from 'vue'
import { collections } from '../../data/collections.js'
import { getCollectionWorkflows } from '../../data/services/workflowService.js'
import WorkflowCard from '../workflow/WorkflowCard.vue'
import { useScrollAnimation } from '../../composables/useScrollAnimation.js'

// Load 5 workflows per collection for homepage preview
const collectionsData = collections.map((c) => ({
  ...c,
  workflows: getCollectionWorkflows(c.id, 5),
}))

const sectionRef = ref(null)
const { staggerChildren } = useScrollAnimation()

onMounted(() => {
  // Stagger each collection row in
  if (sectionRef.value) {
    const rows = sectionRef.value.querySelectorAll('.collection-row')
    rows.forEach((row) => {
      staggerChildren(row, '.workflow-card', {
        y: 30,
        stagger: 0.08,
      })
    })
  }
})
</script>

<template>
  <section ref="sectionRef" class="curated-collections">
    <div class="curated-collections__container">
      <!-- One row per collection -->
      <div
        v-for="col in collectionsData"
        :key="col.id"
        class="collection-row"
      >
        <div class="collection-row__header">
          <h3 class="collection-row__title">{{ col.title }} workflows</h3>
          <a :href="`/collection/${col.id}`" class="collection-row__link">
            View collection
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
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div class="collection-row__grid">
          <WorkflowCard
            v-for="workflow in col.workflows"
            :key="workflow.id"
            :workflow="workflow"
            variant="compact"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.curated-collections {
  @include section-spacing;

  &__container {
    @include container;
  }

}

// ===== COLLECTION ROW =====
.collection-row {
  & + & {
    margin-top: $space-20;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-3;
  }

  &__title {
    font-size: $text-xl;
    font-weight: $weight-semibold;
    color: $color-text-primary;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: $space-1;
    font-size: $text-sm;
    font-weight: $weight-medium;
    color: $color-primary-light;
    text-decoration: none;
    transition: color $transition-fast;

    &:hover {
      color: $color-primary;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: $space-5;

    @include respond-below('xl') {
      grid-template-columns: repeat(4, 1fr);
    }

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
