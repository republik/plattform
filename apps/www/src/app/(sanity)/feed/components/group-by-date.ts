'use client'

import { TeaserSmallFragmentType } from '@/app/(sanity)/groq/teaser-small-fragment'
import {
  formatDate,
  formatDateKey,
  formatWeekday,
} from '@/app/lib/util/time-format'
import { stegaClean } from 'next-sanity'

type TeaserGroup = {
  key: string
  label: string
  labelLg: string
  teasers: TeaserSmallFragmentType[]
}

export function groupByDate(teasers: TeaserSmallFragmentType[]): TeaserGroup[] {
  const groups: TeaserGroup[] = []
  for (const teaser of teasers) {
    const date = teaser.publishDate
      ? new Date(stegaClean(teaser.publishDate))
      : null
    const key = date ? formatDateKey(date) : 'unknown'
    let group = groups[groups.length - 1]
    if (!group || group.key !== key) {
      group = {
        key,
        label: date ? `${formatWeekday(date)}, ${formatDate(date)}` : '',
        labelLg: date ? `${formatWeekday(date)},\n${formatDate(date)}` : '',
        teasers: [],
      }
      groups.push(group)
    }
    group.teasers.push(teaser)
  }
  return groups
}
