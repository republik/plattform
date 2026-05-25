'use client'

import { SubscriptionObjectType } from '#graphql/republik-api/__generated__/gql/graphql'
import { FollowButton } from '@/app/(sanity)/components/follow/follow-button'
import FollowCollectionContainer from '@/app/(sanity)/components/follow/follow-collection-container'
import { urlFor } from '@/app/(sanity)/lib/urlFor'
import { css } from '@republik/theme/css'
import React from 'react'

function FollowCollectionCard({ collection }) {
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
        <FollowButton type={SubscriptionObjectType.Document} size='small' />
      </div>
      {!!collection.image && (
        <img
          src={urlFor(collection.image).width(360).height(360).url()}
          className={css({
            width: 120,
            height: 120,
            borderRadius: 120,
            ml: 'auto',
            objectFit: 'cover',
          })}
        />
      )}
    </FollowCollectionContainer>
  )
}

export default FollowCollectionCard
