/**
 * Scrapes workflow templates from workflow-templates.vercel.app
 * Usage: node scripts/scrape-templates.js
 * Output: src/data/scraped/templates.json
 */

import { parse } from 'node-html-parser'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://www.comfy.org/workflows'
const OUTPUT_PATH = resolve(__dirname, '../src/data/scraped/templates.json')
const CONCURRENCY = 5
const DELAY_MS = 200

// ─── Listing Page Scraper ────────────────────────────────────────────

async function scrapeListingPage() {
  console.log('Fetching listing page...')
  const res = await fetch(`${BASE_URL}/templates/`)
  const html = await res.text()
  const root = parse(html)

  const cards = root.querySelectorAll('a[href*="/templates/"]')
  const templates = []

  for (const card of cards) {
    const href = card.getAttribute('href')
    if (!href || href === '/templates/' || !href.startsWith('/templates/')) continue
    const slug = href.replace('/templates/', '').replace(/\/$/, '')

    // Title
    const titleEl = card.querySelector('h3, h2')
    const title = titleEl ? titleEl.text.trim() : ''

    // Description
    const descEl = card.querySelector('p')
    const description = descEl ? descEl.text.trim() : ''

    // Category badge (top-left absolute span)
    const catBadge = card.querySelector('span.absolute')
    const category = catBadge ? catBadge.text.trim() : ''

    // Workflow type tag (bottom pill)
    const typeTag = card.querySelector('span.bg-white\\/10')
    // Fallback: find spans inside the bottom row
    let type = ''
    if (typeTag) {
      type = typeTag.text.trim()
    } else {
      const bottomSpans = card.querySelectorAll('span')
      for (const s of bottomSpans) {
        const cls = s.getAttribute('class') || ''
        if (cls.includes('bg-white/10')) {
          type = s.text.trim()
          break
        }
      }
    }

    // Thumbnails
    const imgs = card.querySelectorAll('img')
    const thumbnails = imgs.map((img) => {
      const src = img.getAttribute('src') || ''
      return src.startsWith('/') ? `${BASE_URL}${src}` : src
    }).filter((src) => src.startsWith('http'))

    // Popular indicator
    const isPopular = card.text.includes('Popular')

    if (title) {
      templates.push({ slug, title, description, category, type, thumbnails, isPopular })
    }
  }

  console.log(`  Found ${templates.length} templates on listing page`)
  return templates
}

// ─── Detail Page Scraper ─────────────────────────────────────────────

async function scrapeDetailPage(slug) {
  const url = `${BASE_URL}/templates/${slug}/`
  const res = await fetch(url)
  if (!res.ok) {
    console.warn(`  ⚠ Failed to fetch ${slug}: ${res.status}`)
    return null
  }
  const html = await res.text()
  const root = parse(html)

  const detail = {}

  // Find label sections — labels appear as spans with uppercase class containing section names
  // Labels can be "CATEGORIES", "Categories", "MODELS", "Models", etc.
  const allSpans = root.querySelectorAll('span')

  for (const span of allSpans) {
    const text = span.text.trim()
    const textLower = text.toLowerCase()
    const parent = span.parentNode
    if (!parent) continue

    // Only match leaf-ish spans (the label itself, not a parent containing all text)
    const isLabel = span.childNodes.length <= 1 && text.length < 30

    if (isLabel && textLower === 'categories') {
      // Categories are <a> tags inside a sibling flex-wrap div
      const pillContainer = parent.querySelector('div')
      if (pillContainer && !detail.categories?.length) {
        detail.categories = pillContainer.querySelectorAll('a').map((s) => s.text.trim()).filter(Boolean)
      }
    }

    if (isLabel && textLower === 'models') {
      // Models are inside badge components — get the next sibling div(s)
      // The model text is deep inside nested spans
      const siblings = parent.querySelectorAll('div')
      const modelTexts = []
      for (const div of siblings) {
        // Look for the model name span (has px-[11px] class or similar)
        const innerSpans = div.querySelectorAll('span')
        for (const s of innerSpans) {
          const t = s.text.trim()
          // Skip single-char icons (like "Q" for Qwen) and the label itself
          if (t.length > 2 && t.toLowerCase() !== 'models') {
            modelTexts.push(t)
          }
        }
      }
      if (modelTexts.length && !detail.models?.length) {
        detail.models = [...new Set(modelTexts)]
      }
    }

    if (isLabel && (textLower === 'created by' || textLower === 'author')) {
      const creatorDiv = parent.querySelector('div')
      if (creatorDiv) {
        detail.createdBy = creatorDiv.text.trim()
      }
    }

    if (isLabel && textLower === 'last update') {
      const sibling = span.nextElementSibling
      if (sibling) {
        detail.lastUpdate = sibling.text.trim()
      }
    }
  }

  // Technical details
  const bodyText = root.text
  const sizeMatch = bodyText.match(/Download Size\s+([\d.]+\s*\w+)/)
  const timeMatch = bodyText.match(/Est\.\s*Time\s+([\d-]+\s*\w+)/)
  detail.downloadSize = sizeMatch ? sizeMatch[1].trim() : ''
  detail.estTime = timeMatch ? timeMatch[1].trim() : ''

  return detail
}

// ─── Batch Detail Scraping with Concurrency ──────────────────────────

async function scrapeAllDetails(templates) {
  console.log(`\nScraping ${templates.length} detail pages (concurrency: ${CONCURRENCY})...`)
  const results = new Array(templates.length)
  let completed = 0

  for (let i = 0; i < templates.length; i += CONCURRENCY) {
    const batch = templates.slice(i, i + CONCURRENCY)
    const promises = batch.map(async (t, j) => {
      const detail = await scrapeDetailPage(t.slug)
      results[i + j] = detail
    })
    await Promise.all(promises)
    completed += batch.length
    process.stdout.write(`\r  Progress: ${completed}/${templates.length}`)
    if (i + CONCURRENCY < templates.length) {
      await new Promise((r) => setTimeout(r, DELAY_MS))
    }
  }
  console.log('\n  Done!')
  return results
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log('=== ComfyUI Template Scraper ===\n')

  // Step 1: Scrape listing page
  const templates = await scrapeListingPage()

  // Step 2: Scrape all detail pages
  const details = await scrapeAllDetails(templates)

  // Step 3: Merge listing + detail data
  const merged = templates.map((t, i) => ({
    ...t,
    ...(details[i] || {}),
  }))

  // Step 4: Write output
  const output = {
    scrapedAt: new Date().toISOString(),
    source: `${BASE_URL}/templates/`,
    count: merged.length,
    templates: merged,
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2))
  console.log(`\nWritten ${merged.length} templates to ${OUTPUT_PATH}`)

  // Quick stats
  const withCategories = merged.filter((t) => t.categories?.length > 0).length
  const withModels = merged.filter((t) => t.models?.length > 0).length
  const popular = merged.filter((t) => t.isPopular).length
  console.log(`  With categories: ${withCategories}`)
  console.log(`  With models: ${withModels}`)
  console.log(`  Popular: ${popular}`)
}

main().catch((err) => {
  console.error('Scraper failed:', err)
  process.exit(1)
})
