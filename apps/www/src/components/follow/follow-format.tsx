'use client'

import {
  Document,
  FollowableDocumentDocument,
  SubscriptionObjectType,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { FollowButton } from '@app/components/follow/follow-button'
import { ArticleSection } from '@app/components/ui/section'
import { css } from '@republik/theme/css'
import React from 'react'

function FollowFormat({ path }: { path: string }) {
  const { data } = useQuery(FollowableDocumentDocument, {
    variables: { path },
  })
  const format = data?.document as Document

  if (
    !format ||
    !format.subscribedBy.nodes.find((n) => n.isEligibleForNotifications)
  )
    return null

  // Note: this generic subscribedBy array makes no sense…
  // we could just have a subscription enum instead:
  // [active, inactive, not eligible]
  // (At least on authors and formats – I have given little thought to discussion subscriptions)
  const subscriptionId = format.subscribedBy.nodes.find((n) => n.active)?.id

  return (
    <ArticleSection>
      <div
        className={css({
          mt: 8,
          pt: 8,
          borderTopWidth: '1px',
          borderTopStyle: 'solid',
          borderTopColor: 'text',
        })}
      >
        <h3
          className={css({
            textStyle: 'subtitleBold',
            mb: 4,
          })}
        >
          Mehr von «{format.meta.title}»
        </h3>
        <p className={css({ py: 4, textStyle: 'airy' })}>
          {format.meta.description}
        </p>
        <FollowButton
          type={SubscriptionObjectType.Document}
          subscriptionId={subscriptionId}
          objectId={format.id}
          objectName={format.meta.title}
        />
      </div>
    </ArticleSection>
  )
}

export default FollowFormat
