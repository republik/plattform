'use client'

import {
  FollowableDocumentQuery,
  SubscriptionObjectType,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { FollowButton } from '@app/components/follow/follow-button'
import FollowFormatContainer from '@app/components/follow/follow-format-container'
import { css } from '@republik/theme/css'
import Image from 'next/image'
import React from 'react'

function FollowFormatCard({
  format,
  button,
}: {
  format: FollowableDocumentQuery['document']
  button?: boolean
}) {
  if (!format.subscribedBy.nodes.find((n) => n.isEligibleForNotifications))
    return null

  // Note: this generic subscribedBy array makes no sense…
  // we could just have a subscription enum instead:
  // [active, inactive, not eligible]
  // (At least on authors and formats – I have given little thought to discussion subscriptions)
  const subscriptionId = format.subscribedBy.nodes.find((n) => n.active)?.id

  if (button)
    return (
      <FollowButton
        type={SubscriptionObjectType.Document}
        subscriptionId={subscriptionId}
        objectId={format.id}
        objectName={format.meta.title}
      />
    )

  return (
    <FollowFormatContainer>
      <div className={css({ maxWidth: '480px' })}>
        <h3
          className={css({
            textStyle: 'subtitleBold',
            lineHeight: 1.2,
          })}
        >
          <span data-theme='dark' className={css({ color: 'textSoft' })}>
            Das war:
          </span>
          <br />
          {format.meta.title}
        </h3>
        <p className={css({ py: 4, textStyle: 'airy' })}>
          {format.meta.description}
        </p>
        <FollowButton
          type={SubscriptionObjectType.Document}
          subscriptionId={subscriptionId}
          objectId={format.id}
          objectName={format.meta.title}
          size='small'
        />
      </div>
      <Image
        src={format.meta.image}
        width={120}
        height={120}
        alt=''
        className={css({
          borderRadius: 120,
          width: 120,
          height: 120,
          ml: 'auto',
          objectFit: 'cover',
        })}
      />
    </FollowFormatContainer>
  )
}

export default FollowFormatCard
