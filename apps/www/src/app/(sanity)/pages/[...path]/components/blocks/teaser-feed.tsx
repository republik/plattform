'use client'

import { Button } from '@/app/components/ui/button'
import { useTranslation } from '@/lib/withT'
import { css } from '@republik/theme/css'
import { useState } from 'react'
import { Teaser, type TeaserData } from './teaser'

const PAGE_SIZE = 20

/**
 * A feed of teasers that renders the first {@link PAGE_SIZE} items and reveals
 * the rest in batches on click. All items are already in the page payload, so
 * "load more" is a client-side reveal rather than a new request.
 */
export function TeaserFeed({
  items,
  counter,
}: {
  items: TeaserData[]
  counter?: boolean
}) {
  const { t } = useTranslation()
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const visible = items.slice(0, visibleCount)
  const remaining = items.length - visible.length

  return (
    <div>
      {visible.map((teaser, index) => (
        <Teaser
          key={teaser._id}
          teaser={teaser}
          counter={counter ? index + 1 : undefined}
        />
      ))}
      {remaining > 0 && (
        <div className={css({ mt: 6, display: 'flex', justifyContent: 'center' })}>
          <Button
            variant='outline'
            onClick={() =>
              setVisibleCount((count) => count + PAGE_SIZE)
            }
          >
            {t('feed/loadMore', { count: remaining }, 'Weitere laden')}
          </Button>
        </div>
      )}
    </div>
  )
}
