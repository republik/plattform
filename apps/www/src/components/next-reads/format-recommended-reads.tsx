import { Document } from '#graphql/republik-api/__generated__/gql/graphql'
import { nextReadItemTypography } from '@app/components/next-reads/styles'
import { css, cx } from '@republik/theme/css'
import { linkOverlay } from '@republik/theme/patterns'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

function FormatRecommendedReads({
  articles,
}: {
  articles?: Document[]
  excludedPath?: string
}) {
  const pathname = usePathname()

  if (!articles?.length) return null

  return (
    <div>
      {articles
        .filter((doc) => doc.meta.path !== pathname)
        .map((doc) => (
          <div
            key={doc.id}
            className={cx(
              nextReadItemTypography,
              css({
                pb: 8,
                mb: 8,
                borderBottomWidth: 1,
                borderBottomStyle: 'solid',
                borderBottomColor: 'divider',
                position: 'relative', // for the link overlay placement
                // exclude last item from border
                '&:last-of-type': { borderBottom: 'none', pb: 0 },
              }),
            )}
          >
            <h4>
              <Link href={doc.meta.path} className={linkOverlay()}>
                {doc.meta.title}
              </Link>
            </h4>
            <p className='duration'>
              {doc.meta.estimatedReadingMinutes ||
                doc.meta.estimatedConsumptionMinutes}{' '}
              min
            </p>
          </div>
        ))}
    </div>
  )
}

export default FormatRecommendedReads
