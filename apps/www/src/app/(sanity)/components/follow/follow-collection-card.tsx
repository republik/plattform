'use client'

import {
  GetSubscriptionDocument,
  SubscriptionObjectType,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { collectionsDocumentId } from '@/app/(sanity)/components/article-actions/document-id'
import { FollowButton } from '@/app/(sanity)/components/follow/follow-button'
import FollowCollectionContainer from '@/app/(sanity)/components/follow/follow-collection-container'
import { TeaserImage } from '@/app/(sanity)/components/teaser/_shared/teaser-image'
import { useMe } from '@/lib/context/MeContext'
import type { ArticleCollection } from '@/sanity.types'
import { useQuery } from '@apollo/client'
import { css } from '@republik/theme/css'

function FollowCollectionCard({
  collection,
}: {
  collection: Partial<ArticleCollection>
}) {
  const { me, meLoading } = useMe()
  const objectId = collectionsDocumentId({ _id: collection._id })
  const { data, loading } = useQuery(GetSubscriptionDocument, {
    variables: { objectId, type: SubscriptionObjectType.Document },
    skip: !me,
  })

  if (meLoading || !me || loading) return null
  if (!data?.subscribedByMe?.isEligibleForNotifications) return null

  const subscriptionId = data.subscribedByMe.active
    ? data.subscribedByMe.id
    : undefined

  return (
    <FollowCollectionContainer>
      <div>
        <h3
          className={css({
            textStyle: 'subtitleBold',
            lineHeight: 1.2,
          })}
        >
          <span style={{ color: '#909090' }}>Das war:</span>
          <br />
          {collection.title}
        </h3>
        <p className={css({ pt: 1, pb: 4, textStyle: 'airy' })}>
          {collection.description}
        </p>
        <FollowButton
          type={SubscriptionObjectType.Document}
          subscriptionId={subscriptionId}
          objectId={objectId}
          objectName={collection.title}
          size='small'
        />
      </div>
      {!!collection.image && (
        <TeaserImage
          image={collection.image}
          width={360}
          height={360}
          alt={collection.title}
          style={{ objectFit: 'cover', borderRadius: 120, marginLeft: 'auto' }}
        />
      )}
    </FollowCollectionContainer>
  )
}

export default FollowCollectionCard
