import { CuratedFeed } from './feed-curated'
import { FeedsNonCurated } from './feeds-non-curated'

function NextReads({ repoId, path }: { repoId: string; path: string }) {
  return (
    <>
      <CuratedFeed path={path} />
      <FeedsNonCurated repoId={repoId} />
    </>
  )
}

export default NextReads
