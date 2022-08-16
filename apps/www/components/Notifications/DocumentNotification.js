import { TeaserFeed } from '@project-r/styleguide'
import compose from 'lodash/flowRight'
import withT from '../../lib/withT'
import SubscribeCallout from './SubscribeCallout'

export default compose(withT)(({ t, node, isNew, me }) => {
  const { subscription, object } = node
  return (
    <TeaserFeed
      {...object.meta}
      title={object.meta.shortTitle || object.meta.title}
      description={!object.meta.shortTitle && object.meta.description}
      credits={object.meta.credits?.children}
      t={t}
      key={object.meta.path}
      menu={
        <SubscribeCallout
          authorSubscriptions={
            subscription.object.__typename === 'User'
              ? [subscription]
              : undefined
          }
          formatSubscriptions={
            subscription.object.__typename === 'Document'
              ? [subscription]
              : undefined
          }
        />
      }
      highlighted={isNew}
    />
  )
})
