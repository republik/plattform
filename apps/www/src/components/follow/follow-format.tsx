'use client'

import {
  FollowableDocumentDocument,
  NewsletterName,
  SubscriptionObjectType,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { FollowButton } from '@app/components/follow/follow-button'
import NewsletterArticleCard from '@app/components/newsletters/newsletter-article-card'
import { ArticleSection } from '@app/components/ui/section'
import { css } from '@republik/theme/css'
import Image from 'next/image'
import React from 'react'

function FollowFormatContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className={css({ my: 8 })}>
      <ArticleSection>
        <div
          className={css({
            mt: 8,
            pt: 8,
            borderTopWidth: '1px',
            borderTopStyle: 'solid',
            borderTopColor: 'text',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          })}
        >
          {children}
        </div>
      </ArticleSection>
    </div>
  )
}

function FollowFormat({ path }: { path: string }) {
  const { data } = useQuery(FollowableDocumentDocument, {
    variables: { path },
  })
  const format = data?.document

  if (!format) return null

  // Newsletters are handled by a special newsletter component
  // They can be subscribed to, even with users are anonymous.
  const newsletter = format.meta?.newsletter
  if (newsletter)
    return (
      <FollowFormatContainer>
        <NewsletterArticleCard newsletter={newsletter.name as NewsletterName} />
      </FollowFormatContainer>
    )

  if (!format.subscribedBy.nodes.find((n) => n.isEligibleForNotifications))
    return null

  // Note: this generic subscribedBy array makes no sense…
  // we could just have a subscription enum instead:
  // [active, inactive, not eligible]
  // (At least on authors and formats – I have given little thought to discussion subscriptions)
  const subscriptionId = format.subscribedBy.nodes.find((n) => n.active)?.id

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

export default FollowFormat
