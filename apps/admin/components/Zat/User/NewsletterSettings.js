import gql from 'graphql-tag'

import withT from '../../../lib/withT'
import { styles } from './../utils'

export const fragments = gql`
  fragment UserNewsletterSettings on User {
    newsletterSettings {
      status
      subscriptions {
        name
        subscribed
      }
    }
  }
`

export const NewsletterSettings = ({ newsletterSettings, t }) => {
  const newsletterNames = newsletterSettings?.subscriptions
    ?.filter((subscription) => subscription.subscribed)
    .map((subscription) =>
      t(
        `account/newsletterSubscriptions/${subscription.name}/label`,
        undefined,
        subscription.name,
      ),
    )

  return (
    <div {...styles.part}>
      Newsletter{' '}
      {newsletterSettings?.status && <>({newsletterSettings?.status})</>}
      {!!newsletterNames.length && ' · '}
      {newsletterNames
        .map((name) => name)
        .filter(Boolean)
        .join(' · ')}
    </div>
  )
}

export default withT(NewsletterSettings)
