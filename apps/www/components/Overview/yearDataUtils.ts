import { max } from 'd3-array'
import type { Teaser, TeaserNode } from './TeaserBlock'

// Use minimal type for document - actual types will be generated from GraphQL
interface FrontDocument {
  id: string
  content?: {
    children: any[]
  }
  children?: {
    nodes: Array<{
      body: any
    }>
  }
}

/**
 * Extract teasers from a front document
 * Migrated from utils.js
 */
export const getTeasersFromDocument = (doc: FrontDocument | null | undefined): Teaser[] => {
  if (!doc) {
    return []
  }

  const children = doc.children
    ? doc.children.nodes.map((c) => c.body)
    : doc.content?.children || []

  return children
    .map((rootChild: any) => {
      return {
        id: rootChild.data.id,
        contentHash: rootChild.data.contentHash,
        nodes:
          rootChild.identifier === 'TEASERGROUP'
            ? rootChild.children
            : [rootChild],
      }
    })
    .filter(
      (teaser: Teaser) =>
        teaser.nodes[0].identifier !== 'LIVETEASER' &&
        !(
          teaser.nodes[0].identifier === 'TEASER' &&
          teaser.nodes[0].data &&
          teaser.nodes[0].data.teaserType === 'carousel'
        ),
    )
}

/**
 * Extract and set publish dates for teasers
 */
export const enrichTeasersWithPublishDates = (
  teasers: Teaser[],
  startDate: Date,
  endDate: Date,
): Teaser[] => {
  return teasers
    .reverse()
    .map((teaser, i, all) => {
      const publishDates = teaser.nodes
        .map((node: TeaserNode) => {
          if (
            node.data.urlMeta &&
            // workaround for «aufdatierte» tutorials and meta texts
            node.data.urlMeta.format !== 'republik/format-aus-der-redaktion' &&
            node.data.urlMeta.publishDate
          ) {
            return new Date(node.data.urlMeta.publishDate)
          }
          return null
        })
        .filter(Boolean) as Date[]

      teaser.publishDate = publishDates.length
        ? max(publishDates)
        : i > 0
        ? all[i - 1].publishDate
        : undefined

      return teaser
    })
    .filter((teaser) => {
      return (
        teaser.publishDate &&
        teaser.publishDate >= startDate &&
        teaser.publishDate < endDate
      )
    })
}

/**
 * Filter teasers by specific month
 */
export const filterTeasersByMonth = (
  teasers: Teaser[],
  year: number,
  month: number, // 1-12
): Teaser[] => {
  // Create date range for the month
  // Month is 1-indexed (1 = January), but Date constructor is 0-indexed
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 1) // First day of next month

  return teasers.filter((teaser) => {
    return (
      teaser.publishDate &&
      teaser.publishDate >= startDate &&
      teaser.publishDate < endDate
    )
  })
}

/**
 * Get all months (1-12) that have content in a given year
 */
export const getMonthsWithContent = (
  teasers: Teaser[],
  year: number,
): number[] => {
  const months = new Set<number>()

  teasers.forEach((teaser) => {
    if (
      teaser.publishDate &&
      teaser.publishDate.getFullYear() === year
    ) {
      months.add(teaser.publishDate.getMonth() + 1) // Convert 0-indexed to 1-indexed
    }
  })

  return Array.from(months).sort((a, b) => a - b)
}

/**
 * Find the nearest month with content
 * Returns the closest month number (1-12), preferring later months
 */
export const getNearestMonthWithContent = (
  teasers: Teaser[],
  year: number,
  targetMonth: number,
): number | null => {
  const monthsWithContent = getMonthsWithContent(teasers, year)

  if (monthsWithContent.length === 0) {
    return null
  }

  // If target month has content, return it
  if (monthsWithContent.includes(targetMonth)) {
    return targetMonth
  }

  // Find nearest month, preferring later months
  let nearest = monthsWithContent[0]
  let minDiff = Math.abs(targetMonth - nearest)

  for (const month of monthsWithContent) {
    const diff = Math.abs(targetMonth - month)
    if (diff < minDiff || (diff === minDiff && month > nearest)) {
      nearest = month
      minDiff = diff
    }
  }

  return nearest
}

/**
 * Get month name in German
 */
export const getMonthName = (month: number): string => {
  const monthNames = [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ]
  return monthNames[month - 1] || ''
}

/**
 * Prepare teasers for a specific year
 * Filters by year and enriches with publish dates
 */
export const prepareTeasersForYear = (
  doc: FrontDocument | null,
  year: number,
): Teaser[] => {
  const startDate = new Date(`${year - 1}-12-31T23:00:00.000Z`)
  const endDate = new Date(`${year}-12-31T23:00:00.000Z`)

  const teasers = getTeasersFromDocument(doc)
  return enrichTeasersWithPublishDates(teasers, startDate, endDate)
}
