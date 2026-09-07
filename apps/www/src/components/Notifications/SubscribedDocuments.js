import { useSanityCollections } from '@/lib/use-sanity-data'
import { graphql } from '@apollo/client/react/hoc'
import {
  A,
  Interaction,
  mediaQueries,
  plainButtonRule,
} from '@project-r/styleguide'
import { css } from 'glamor'
import compose from 'lodash/flowRight'

import { urlFor } from '@/app/(sanity)/lib/urlFor'
import withT from '@/lib/withT'
import Image from 'next/image'
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
}) => {
  const subscriptions = myDocumentSubscriptions?.subscribedTo.nodes.filter(
    (subscription) =>
      subscription.active &&
      subscription.documentDetails.__typename === 'SanityDocumentRef' &&
      subscription.documentDetails?.id,
  )

  const collectionsById = useSanityCollections(
    subscriptions?.length > 0
      ? subscriptions.map((s) => s.documentDetails.id)
      : [],
  )

  return (
    <Loader
      loading={
        loading || Object.keys(collectionsById).length < subscriptions.length
      }
      error={error}
      render={() => {
        if (!subscriptions.length) {
          return (
            <Interaction.P>
              {t('Notifications/settings/formats/summary/0')}
            </Interaction.P>
          )
        }

        return (
          <div {...styles.formats}>
            {subscriptions.map((subscription, i) => {
              const collection =
                collectionsById[subscription.documentDetails.id]

              let imageSrc
              try {
                imageSrc = urlFor(collection.image).width(96).height(96).url()
              } catch (e) {
                console.warn(e)
              }

              return (
                <div {...styles.formatContainer} key={subscription.id}>
                  <div {...styles.formatImage}>
                    {imageSrc ? (
                      <Image
                        className={styles.formatImagePicture}
                        src={imageSrc}
                        width={48}
                        height={48}
                        alt=''
                        unoptimized
                      />
                    ) : (
                      <span {...styles.formatImageFallback}>
                        {collection.title.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span {...styles.formatTitle}>{collection.title}</span>

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
}

export default compose(
  withT,
  withMembership,
  graphql(myDocumentSubscriptions),
  withUnsubFromDoc,
)(SubscribedDocuments)
