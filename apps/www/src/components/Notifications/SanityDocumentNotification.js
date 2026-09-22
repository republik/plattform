import { TeaserFeed } from '@project-r/styleguide'
import compose from 'lodash/flowRight'
import withT from '@/lib/withT'
import FeedTeaser from '@/app/(sanity)/components/teaser/feed'
import { token } from '@republik/theme/tokens'

export default compose(withT)(({ t, node, article, isNew }) => {
  return (
    <div
      style={{
        background: isNew ? token('colors.background.alert') : undefined,
      }}
    >
      <FeedTeaser teaser={article} />
    </div>
  )
})
