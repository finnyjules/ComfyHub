import { transformedWorkflows } from '../scraped/transform.js'
import { generateCreators } from './generators/creators.js'
import { generateComments } from './generators/comments.js'
import { categories, baseModels, techniques } from './generators/categories.js'

const rawWorkflows = transformedWorkflows
const creators = generateCreators(50)

// Add the ComfyUI official creator (referenced by scraped workflows)
if (!creators.find((c) => c.handle === '@comfyui')) {
  creators.push({
    id: 'cr_comfyui',
    handle: '@comfyui',
    displayName: 'ComfyUI',
    bio: 'The official ComfyUI account. Sharing templates, workflows, and best practices for the ComfyUI community.',
    avatarUrl: 'https://preview.redd.it/new-comfyui-logo-icon-v0-c05cowjywfze1.png?width=640&crop=smart&auto=webp&s=d381ee8ada0a2b993684c9ef26daf744c43350e2',
    bannerUrl: 'https://picsum.photos/seed/banner_comfyui/1200/300',
    badges: ['verified', 'staff-pick'],
    stats: {
      workflowCount: 0,
      totalRuns: 500000,
      totalFavorites: 30000,
      totalForks: 5000,
      followers: 25000,
      following: 0,
    },
    pinnedWorkflowIds: [],
    collections: [],
    socialLinks: {
      twitter: 'https://x.com/comaborat',
      github: 'https://github.com/comfyanonymous/ComfyUI',
      website: 'https://www.comfy.org',
    },
    joinedAt: '2024-01-01T00:00:00Z',
  })
}

// Scraped creators from X/Twitter
const scrapedCreators = [
  {
    id: 'cr_hellorob',
    handle: '@hellorob',
    displayName: 'rob - comfyui',
    bio: 'ComfyUI workflow creator sharing free workflows and tutorials. Fixing AI-generated skin, testing new models, and building one-click solutions for the community.',
    avatarUrl: 'https://pbs.twimg.com/profile_images/1886131820737011712/IQ3fYbzA_400x400.jpg',
    bannerUrl: 'https://picsum.photos/seed/banner_hellorob/1200/300',
    badges: ['verified', 'top-creator'],
    stats: {
      workflowCount: 0,
      totalRuns: 180000,
      totalFavorites: 12000,
      totalForks: 2800,
      followers: 3844,
      following: 210,
    },
    pinnedWorkflowIds: [],
    collections: [],
    socialLinks: {
      twitter: 'https://x.com/hellorob',
    },
    joinedAt: '2023-02-15T00:00:00Z',
  },
  {
    id: 'cr_purzbeats',
    handle: '@PurzBeats',
    displayName: 'Purz.ai',
    bio: 'Creative exploration with ComfyUI and Blender. Live streams, tutorials, and workflow drops. Building the bridge between 3D and AI generation.',
    avatarUrl: 'https://pbs.twimg.com/profile_images/1590795790146015238/bHAco6jp_400x400.jpg',
    bannerUrl: 'https://picsum.photos/seed/banner_purzbeats/1200/300',
    badges: ['verified', 'community-favorite'],
    stats: {
      workflowCount: 0,
      totalRuns: 95000,
      totalFavorites: 7500,
      totalForks: 1600,
      followers: 5200,
      following: 340,
    },
    pinnedWorkflowIds: [],
    collections: [],
    socialLinks: {
      twitter: 'https://x.com/PurzBeats',
      website: 'https://purz.ai',
    },
    joinedAt: '2023-06-01T00:00:00Z',
  },
  {
    id: 'cr_8bit_e',
    handle: '@8bit_e',
    displayName: 'enigmatic_e',
    bio: 'AI artist blending ComfyUI, Viggle, and After Effects. Experimenting with Wan, Flux Kontext, and 3D models. Understanding tools builds confidence to create.',
    avatarUrl: 'https://pbs.twimg.com/profile_images/1122002553057599488/2J9M3WmW_400x400.jpg',
    bannerUrl: 'https://picsum.photos/seed/banner_8bit_e/1200/300',
    badges: ['verified', 'rising-star'],
    stats: {
      workflowCount: 0,
      totalRuns: 62000,
      totalFavorites: 4200,
      totalForks: 900,
      followers: 2100,
      following: 180,
    },
    pinnedWorkflowIds: [],
    collections: [],
    socialLinks: {
      twitter: 'https://x.com/8bit_e',
    },
    joinedAt: '2023-10-20T00:00:00Z',
  },
]

scrapedCreators.forEach((sc) => {
  if (!creators.find((c) => c.handle === sc.handle)) {
    creators.push(sc)
  }
})

// Randomly assign some existing workflows to the scraped creators
// Uses a simple seeded shuffle so assignments are stable across builds
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rand = seededRandom(12345)
const scrapedCreatorIds = scrapedCreators.map((c) => c.id)

// Build a Set of workflow IDs to reassign (take from any creator except the scraped ones themselves)
const reassignableWorkflows = rawWorkflows.filter(
  (w) => !scrapedCreatorIds.includes(w.creator.id)
)
const shuffled = [...reassignableWorkflows].sort(() => rand() - 0.5)
const toReassignIds = new Set(shuffled.slice(0, 30).map((w) => w.id))

// Build the final workflows array with reassignments baked in
let reassignIndex = 0
const workflows = rawWorkflows.map((w) => {
  if (toReassignIds.has(w.id)) {
    const newCreator = scrapedCreators[reassignIndex % scrapedCreators.length]
    reassignIndex++
    return {
      ...w,
      creator: {
        id: newCreator.id,
        handle: newCreator.handle,
        displayName: newCreator.displayName,
        avatarUrl: newCreator.avatarUrl,
      },
    }
  }
  return w
})

// Link creators to their workflows
creators.forEach((creator) => {
  const creatorWorkflows = workflows.filter((w) => w.creator.id === creator.id)
  creator.stats.workflowCount = creatorWorkflows.length
  creator.pinnedWorkflowIds = creatorWorkflows.slice(0, Math.min(3, creatorWorkflows.length)).map((w) => w.id)

  // Build collections from creator's workflows
  if (creatorWorkflows.length >= 3) {
    const grouped = {}
    creatorWorkflows.forEach((w) => {
      if (!grouped[w.category]) grouped[w.category] = []
      grouped[w.category].push(w.id)
    })
    creator.collections = Object.entries(grouped)
      .filter(([, ids]) => ids.length >= 2)
      .slice(0, 3)
      .map(([catId, ids], i) => ({
        id: `col_${creator.id}_${i}`,
        name: `${categories.find((c) => c.id === catId)?.label ?? catId} Collection`,
        description: `A curated collection of ${ids.length} workflows`,
        workflowIds: ids,
        coverUrl: `https://picsum.photos/seed/col_${creator.id}_${i}/400/300`,
      }))
  }
})

const workflowIds = workflows.map((w) => w.id)
const comments = generateComments(500, workflowIds)

// Update comment counts on workflows
workflows.forEach((w) => {
  w.stats.comments = comments.filter((c) => c.workflowId === w.id).length
})

export { workflows, creators, comments, categories, baseModels, techniques }
