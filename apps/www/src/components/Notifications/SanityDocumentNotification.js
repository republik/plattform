import FeedTeaser from '@/app/(sanity)/components/teaser/feed'
import withT from '@/lib/withT'
import { token } from '@republik/theme/tokens'
import compose from 'lodash/flowRight'

export default compose(withT)(({ t, node, article, isNew }) => {
  return (
    <div
      style={{
        background: isNew ? token('colors.background.alert') : undefined,
      }}
    >
      <FeedTeaser teaser={article} skipPublishDate />
    </div>
  )
})
