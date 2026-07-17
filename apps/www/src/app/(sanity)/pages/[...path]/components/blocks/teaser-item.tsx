import { TeaserLarge } from '@/app/(sanity)/components/teaser/large'
import type { FrontTeaserFragmentType } from '@/app/(sanity)/groq/teaser-large-fragment'
import { css } from '@republik/theme/css'

export async function TeaserItem({
  reference,
}: {
  reference: FrontTeaserFragmentType
}) {
  return (
    <div className={css({ gridColumn: 'full', m: 0 })}>
      <TeaserLarge {...reference} />
    </div>
  )
}
