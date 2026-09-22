'use client'

import { SubscriptionObjectType } from '#graphql/republik-api/__generated__/gql/graphql'
import { FollowButton } from '@/app/(sanity)/components/follow/follow-button'
import FollowCollectionContainer from '@/app/(sanity)/components/follow/follow-collection-container'
import { TeaserImage } from '@/app/(sanity)/components/teaser/_shared/teaser-image'
import { useMe } from '@/lib/context/MeContext'
import type { ArticleCollection } from '@/sanity.types'
import { css } from '@republik/theme/css'

function FollowCollectionCard({
  collection,
}: {
  collection: Partial<ArticleCollection>
}) {
  const { me, meLoading } = useMe()

  if (meLoading || !me) return null

  return (
    <FollowCollectionContainer>
      <div className={css({ flex: 1, minWidth: 0 })}>
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
          objectId={`sanity:${collection._id}`}
          type={SubscriptionObjectType.Document}
          size='small'
        />
      </div>
      {!!collection.image && (
        <TeaserImage
          image={collection.image}
          width={360}
          height={360}
          alt={collection.title}
          style={{
            objectFit: 'cover',
            borderRadius: 120,
            marginLeft: 'auto',
            width: 120,
            height: 120,
            flexShrink: 0,
          }}
        />
      )}
    </FollowCollectionContainer>
  )
}

export default FollowCollectionCard
