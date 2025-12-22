import { css } from '@republik/theme/css'

import { CuratedFeed } from './feed-curated'
import { FeedsNonCurated } from './feeds-non-curated'

function NextReads({ repoId, path }: { repoId: string; path: string }) {
  return (
    <div className={css({ pt: 16 })}>
      <CuratedFeed path={path} />
      <FeedsNonCurated repoId={repoId} />
    </div>
  )
}

export default NextReads
