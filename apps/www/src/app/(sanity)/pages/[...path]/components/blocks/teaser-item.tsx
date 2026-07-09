import { FrontTeaser } from '@/app/(sanity)/components/teaser/front/front-teaser'
import type { FrontTeaserFragmentType } from '@/app/(sanity)/groq/front-teaser-fragment'
import { css } from '@republik/theme/css'

export async function TeaserItem({
  reference,
}: {
  reference: FrontTeaserFragmentType
}) {
  return (
    <div className={css({ gridColumn: 'full', m: 0 })}>
      <FrontTeaser {...reference} />
    </div>
  )
}
