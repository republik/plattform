import { graphql } from '@apollo/client/react/hoc'
import { A, mediaQueries, plainButtonRule } from '@project-r/styleguide'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import Image from 'next/image'
import Link from 'next/link'
import withT from '@/lib/withT'
import { withMembership } from '../Auth/checkRoles'
import Loader from '../Loader'
import { myDocumentSubscriptions, withUnsubFromDoc } from './enhancers'

const styles = {
  formats: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  }),
  formatContainer: css({
    display: 'grid',
    columnGap: 16,
    gridTemplateColumns: '64px 1fr',
    gridTemplateAreas: `"image title"
      "image actions"`,
    placeItems: 'center start',
    [mediaQueries.mUp]: {
      gridTemplateColumns: '64px 1fr max-content',
      gridTemplateAreas: '"image title actions"',
    },
  }),
  formatImage: css({
    gridArea: 'image',
    backgroundColor: 'var(--color-hover)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    boxSizing: 'border-box',
  }),
  formatImagePicture: css({
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  }),
  formatImageFallback: css({
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 1,
  }),
  formatTitle: css({
    gridArea: 'title',
    display: 'block',
    fontWeight: '700',
    textDecoration: 'none',
  }),
  actions: css({
    gridArea: 'actions',
  }),
}

const SubscribedDocuments = ({
  t,
  unsubFromDoc,
  data: { myDocumentSubscriptions, loading, error },
}) => (
  <Loader
    loading={loading}
    error={error}
    render={() => {
      const subscriptions = myDocumentSubscriptions.subscribedTo.nodes.filter(
        (subscription) =>
          subscription.active &&
          subscription.documentDetails?.meta.template === 'format',
      )

      if (!subscriptions.length) return null

      return (
        <div {...styles.formats}>
          {subscriptions.map((subscription) => {
            const format = subscription.documentDetails
            return (
              <div {...styles.formatContainer} key={subscription.id}>
                <div {...styles.formatImage}>
                  {format.meta.image ? (
                    <Image
                      className={styles.formatImagePicture}
                      src={format.meta.image}
                      width={48}
                      height={48}
                      alt=''
                    />
                  ) : (
                    <span
                      {...styles.formatImageFallback}
                      style={{ color: format.meta.color }}
                    >
                      {format.meta.title.charAt(0)}
                    </span>
                  )}
                </div>
                <Link {...styles.formatTitle} href={format.meta.path}>
                  {format.meta.title}
                </Link>
                <div {...styles.actions}>
                  <button
                    {...plainButtonRule}
                    onClick={() =>
                      unsubFromDoc({ subscriptionId: subscription.id })
                    }
                  >
                    <A>{t('Notifications/settings/formats/unsubscribe')}</A>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )
    }}
  />
)

export default compose(
  withT,
  withMembership,
  graphql(myDocumentSubscriptions),
  withUnsubFromDoc,
)(SubscribedDocuments)
