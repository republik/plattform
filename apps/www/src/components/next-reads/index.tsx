import { css } from '@republik/theme/css'

import { CuratedFeed } from './feed-curated'
import { FeedsNonCurated } from './feeds-non-curated'

function NextReads({ repoId }: { repoId: string }) {
  return (
    <div className={css({ pt: 16 })}>
      <CuratedFeed />
      <FeedsNonCurated repoId={repoId} />
    </div>
  )
}

export default NextReads
