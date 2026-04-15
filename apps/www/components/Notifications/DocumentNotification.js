import { TeaserFeed } from '@project-r/styleguide'
import compose from 'lodash/flowRight'
import withT from '../../lib/withT'

export default compose(withT)(({ t, node, isNew }) => {
  const { object } = node
  return (
    <TeaserFeed
      {...object.meta}
      title={object.meta.shortTitle || object.meta.title}
      description={!object.meta.shortTitle && object.meta.description}
      credits={object.meta.credits}
      t={t}
      key={object.meta.path}
      highlighted={isNew}
    />
  )
})
