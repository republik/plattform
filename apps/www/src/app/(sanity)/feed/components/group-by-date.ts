'use client'

import { TeaserSmallFragmentType } from '@/app/(sanity)/groq/teaser-small-fragment'
import { dateFormat, timeFormat } from '@/lib/utils/format'
import { stegaClean } from 'next-sanity'

const dateKey = timeFormat('%Y-%m-%d')
const dateLabel = timeFormat(`%A, ${dateFormat}`)
const dateLabelLg = timeFormat(`%A,\n${dateFormat}`)

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
    const key = date ? dateKey(date) : 'unknown'
    let group = groups[groups.length - 1]
    if (!group || group.key !== key) {
      group = {
        key,
        label: date ? dateLabel(date) : '',
        labelLg: date ? dateLabelLg(date) : '',
        teasers: [],
      }
      groups.push(group)
    }
    group.teasers.push(teaser)
  }
  return groups
}
