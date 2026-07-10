'use client'

import FeedTeaser from '@/app/(sanity)/components/teaser/feed'
import { TeaserFragmentType } from '@/app/(sanity)/groq/teaser-fragment'
import { useTranslation } from '@/lib/withT'
import { css } from '@republik/theme/css'
import React from 'react'

export function TeaserFeed({
  title,
  total,
  teasers,
}: {
  title?: string
  total: number
  teasers: TeaserFragmentType[]
}) {
  const { t } = useTranslation()

  return (
    <>
      <h2 className={css({ textStyle: 'subtitleBold', mb: '8', mt: '16' })}>
        {title ||
          t.pluralize('feed/title', {
            count: total,
          })}
      </h2>

      {teasers.map((teaser) => (
        <FeedTeaser key={teaser._id} teaser={teaser} />
      ))}
    </>
  )
}
