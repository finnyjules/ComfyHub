<script setup>
import { ref, computed, watch } from 'vue'
import { getComments, getCommentCount, getQuestionCount, getShowcaseCount } from '../../data/services/commentService.js'
import { timeAgo } from '../../lib/formatters.js'

const props = defineProps({
  workflowId: { type: String, required: true },
})

// -- Tabs --
const activeTab = ref('all')
const tabs = computed(() => [
  { key: 'all', label: 'All', count: count.value },
  { key: 'question', label: 'Questions', count: questionCount.value },
  { key: 'showcase', label: 'Showcase', count: showcaseCount.value },
])

// -- Sort --
const activeSort = ref('newest')
const sortOptions = [
  { key: 'newest', label: 'Newest' },
  { key: 'helpful', label: 'Most Helpful' },
  { key: 'creator', label: 'Creator First' },
]

// -- Counts --
const count = ref(getCommentCount(props.workflowId))
const questionCount = ref(getQuestionCount(props.workflowId))
const showcaseCount = ref(getShowcaseCount(props.workflowId))

// -- Comments --
const comments = ref(getComments(props.workflowId, { type: 'all', sort: 'newest' }))

watch([activeTab, activeSort], ([tab, sort]) => {
  comments.value = getComments(props.workflowId, { type: tab, sort })
})

// -- Upvote (local state only) --
const upvoted = ref(new Set())

function toggleUpvote(commentId) {
  if (upvoted.value.has(commentId)) {
    upvoted.value.delete(commentId)
  } else {
    upvoted.value.add(commentId)
  }
  // Trigger reactivity
  upvoted.value = new Set(upvoted.value)
}

function getUpvoteCount(comment) {
  const base = comment.upvotes || 0
  return upvoted.value.has(comment.id) ? base + 1 : base
}

// -- Comment input (UI only) --
const newCommentText = ref('')
</script>

<template>
  <section class="comment-section">
    <h2 class="comment-section__heading">Comments ({{ count }})</h2>

    <!-- Comment input form -->
    <div class="comment-section__form">
      <textarea
        v-model="newCommentText"
        class="comment-section__textarea"
        placeholder="Share your thoughts, ask a question, or showcase your results..."
        rows="3"
      />
      <div class="comment-section__form-actions">
        <button
          class="comment-section__submit"
          :disabled="!newCommentText.trim()"
        >
          Post Comment
        </button>
      </div>
    </div>

    <!-- Tabs & Sort bar -->
    <div class="comment-section__toolbar">
      <div class="comment-section__tabs" role="tablist" aria-label="Comment filters">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          role="tab"
          :aria-selected="activeTab === tab.key"
          class="comment-section__tab"
          :class="{ 'comment-section__tab--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span class="comment-section__tab-count">{{ tab.count }}</span>
        </button>
      </div>
      <div class="comment-section__sort">
        <select v-model="activeSort" class="comment-section__sort-select" aria-label="Sort comments">
          <option v-for="opt in sortOptions" :key="opt.key" :value="opt.key">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Comment list -->
    <div class="comment-section__list">
      <div
        v-for="comment in comments.slice(0, 10)"
        :key="comment.id"
        class="comment-section__item"
        :class="{ 'comment-section__item--creator': comment.isCreatorReply }"
      >
        <img :src="comment.author.avatarUrl" :alt="comment.author.displayName" class="comment-section__avatar" />
        <div class="comment-section__body">
          <div class="comment-section__meta">
            <span class="comment-section__author">
              {{ comment.author.displayName }}
              <span v-if="comment.isCreatorReply" class="comment-section__badge">Creator</span>
            </span>
            <span class="comment-section__time">{{ timeAgo(comment.createdAt) }}</span>
          </div>
          <p class="comment-section__text">{{ comment.content }}</p>
          <div class="comment-section__actions">
            <button
              class="comment-section__upvote"
              :class="{ 'comment-section__upvote--active': upvoted.has(comment.id) }"
              @click="toggleUpvote(comment.id)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
              <span>{{ getUpvoteCount(comment) }}</span>
            </button>
          </div>

          <!-- Threaded replies -->
          <div v-if="comment.replies?.length" class="comment-section__replies">
            <div
              v-for="reply in comment.replies"
              :key="reply.id"
              class="comment-section__reply"
              :class="{ 'comment-section__reply--creator': reply.isCreatorReply }"
            >
              <img :src="reply.author.avatarUrl" :alt="reply.author.displayName" class="comment-section__avatar comment-section__avatar--small" />
              <div class="comment-section__body">
                <div class="comment-section__meta">
                  <span class="comment-section__author">
                    {{ reply.author.displayName }}
                    <span v-if="reply.isCreatorReply" class="comment-section__badge">Creator</span>
                  </span>
                  <span class="comment-section__time">{{ timeAgo(reply.createdAt) }}</span>
                </div>
                <p class="comment-section__text">{{ reply.content }}</p>
                <div class="comment-section__actions">
                  <button
                    class="comment-section__upvote"
                    :class="{ 'comment-section__upvote--active': upvoted.has(reply.id) }"
                    @click="toggleUpvote(reply.id)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                    <span>{{ getUpvoteCount(reply) }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.comment-section {
  &__heading {
    font-size: $text-xl;
    font-weight: $weight-bold;
    color: $color-text-primary;
    margin-bottom: $space-5;
  }

  // -- Comment input form --
  &__form {
    margin-bottom: $space-6;
    padding-bottom: $space-6;
    border-bottom: 1px solid $color-border;
  }

  &__textarea {
    width: 100%;
    background: $color-bg-secondary;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    color: $color-text-primary;
    font-size: $text-sm;
    padding: $space-3;
    resize: vertical;
    min-height: 72px;
    transition: border-color $transition-fast;
    font-family: inherit;

    &::placeholder {
      color: $color-text-tertiary;
    }

    &:focus {
      outline: none;
      border-color: $color-primary;
    }
  }

  &__form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: $space-2;
  }

  &__submit {
    padding: $space-2 $space-5;
    font-size: $text-sm;
    font-weight: $weight-medium;
    color: #fff;
    background: $color-primary;
    border: none;
    border-radius: $radius-md;
    cursor: pointer;
    transition: background $transition-fast, opacity $transition-fast;

    &:hover:not(:disabled) {
      background: $color-primary-light;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  // -- Toolbar (tabs + sort) --
  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-5;
    gap: $space-3;
    flex-wrap: wrap;
  }

  &__tabs {
    display: flex;
    gap: $space-1;
  }

  &__tab {
    padding: $space-2 $space-3;
    font-size: $text-sm;
    font-weight: $weight-medium;
    color: $color-text-tertiary;
    background: none;
    border: none;
    border-radius: $radius-md;
    cursor: pointer;
    transition: background $transition-fast, color $transition-fast;
    display: flex;
    align-items: center;
    gap: $space-1;

    &:hover {
      background: $color-bg-tertiary;
      color: $color-text-secondary;
    }

    &--active {
      background: $color-bg-tertiary;
      color: $color-text-primary;
    }
  }

  &__tab-count {
    font-size: $text-xs;
    color: $color-text-tertiary;
    background: $color-bg-secondary;
    padding: 1px $space-2;
    border-radius: $radius-full;
    min-width: 20px;
    text-align: center;
  }

  &__sort-select {
    background: $color-bg-secondary;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    color: $color-text-secondary;
    font-size: $text-sm;
    padding: $space-1 $space-3;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: $color-primary;
    }
  }

  // -- Comment list --
  &__list {
    display: flex;
    flex-direction: column;
    gap: $space-5;
  }

  &__item {
    display: flex;
    gap: $space-3;
    padding-bottom: $space-5;
    border-bottom: 1px solid $color-border;

    &--creator {
      border-left: 3px solid $color-primary;
      padding-left: $space-3;
      border-radius: 2px;
    }
  }

  &__avatar {
    width: 36px;
    height: 36px;
    border-radius: $radius-full;
    object-fit: cover;
    flex-shrink: 0;

    &--small {
      width: 28px;
      height: 28px;
    }
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: $space-2;
    margin-bottom: $space-1;
  }

  &__author {
    font-size: $text-sm;
    font-weight: $weight-medium;
    color: $color-text-primary;
    display: flex;
    align-items: center;
    gap: $space-2;
  }

  &__badge {
    font-size: $text-xs;
    font-weight: $weight-semibold;
    color: $color-primary-light;
    background: rgba($color-primary, 0.15);
    padding: 1px $space-2;
    border-radius: $radius-full;
    letter-spacing: 0.3px;
  }

  &__time {
    font-size: $text-xs;
    color: $color-text-tertiary;
  }

  &__text {
    font-size: $text-sm;
    color: $color-text-secondary;
    line-height: $leading-normal;
    margin-bottom: $space-2;
  }

  // -- Upvote --
  &__actions {
    display: flex;
    gap: $space-3;
  }

  &__upvote {
    display: flex;
    align-items: center;
    gap: $space-1;
    font-size: $text-xs;
    color: $color-text-tertiary;
    background: none;
    border: none;
    cursor: pointer;
    padding: $space-1 $space-2;
    border-radius: $radius-sm;
    transition: background $transition-fast, color $transition-fast;

    &:hover {
      background: $color-bg-tertiary;
      color: $color-text-secondary;
    }

    &--active {
      color: $color-primary-light;

      &:hover {
        color: $color-primary;
      }
    }
  }

  // -- Threaded replies --
  &__replies {
    margin-top: $space-4;
    padding-left: $space-4;
    border-left: 2px solid $color-border;
    display: flex;
    flex-direction: column;
    gap: $space-4;
  }

  &__reply {
    display: flex;
    gap: $space-3;

    &--creator {
      border-left: 2px solid $color-primary;
      padding-left: $space-3;
      border-radius: 1px;
    }
  }
}
</style>
