import { TeaserListItemType } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import { timeFormat } from '@/lib/utils/format'
import { stegaClean } from 'next-sanity'
import { Fragment } from 'react'

const formatDate = timeFormat('%d.%m.%Y')

// "A", "A und B", "A, B und C"
const contributorsList = new Intl.ListFormat('de', { type: 'conjunction' })

export function formatContributors(
  teaser: TeaserListItemType,
): string | undefined {
  const names = (teaser.contributors ?? [])
    .map((c) => c.name)
    .filter((name): name is string => !!name)

  if (!names.length) return undefined

  return `Von ${contributorsList.format(names)}`
}

// "01.01.2026"
export function formatPublishDate(
  teaser: TeaserListItemType,
): string | undefined {
  if (!teaser.publishDate) return undefined

  return formatDate(new Date(stegaClean(teaser.publishDate)))
}

// "Von A und B, 01.01.2026"
export function TeaserByline({
  teaser,
  skipPublishDate,
}: {
  teaser: TeaserListItemType
  skipPublishDate?: boolean
}) {
  const parts = [
    formatContributors(teaser),
    !skipPublishDate && formatPublishDate(teaser),
  ].filter(Boolean)

  if (!parts.length) return null

  return (
    <p className='byline'>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index > 0 && ', '}
          {part}
        </Fragment>
      ))}
    </p>
  )
}
