import { TeaserLarge } from '@/app/(sanity)/components/teaser/large'
import type { TeaserLargeFragmentType } from '@/app/(sanity)/groq/teaser-large-fragment'
import { css } from '@republik/theme/css'

export async function TeaserItem({
  reference,
}: {
  reference: TeaserLargeFragmentType
}) {
  return (
    <div className={css({ gridColumn: 'full', m: 0 })}>
      <TeaserLarge {...reference} />
    </div>
  )
}
