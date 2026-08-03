import {
  FollowableAuthorDocument,
  SubscriptionObjectType,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { FollowButton } from '@/app/(sanity)/components/follow/follow-button'
import type { ArticleContributor } from '@/app/(sanity)/lib/types'
import { urlFor } from '@/app/(sanity)/lib/urlFor'
import { useQuery } from '@apollo/client'
import { css } from '@republik/theme/css'
import { linkOverlay } from '@republik/theme/patterns'
import Link from 'next/link'
import React from 'react'

function FollowContributorCard({
  contributor,
}: {
  contributor: ArticleContributor
}) {
  const { data } = useQuery(FollowableAuthorDocument, {
    variables: { id: contributor.userId },
    skip: !contributor.userId,
  })
  const author = data?.user

  if (!author?.subscribedBy.nodes.find((n) => n.isEligibleForNotifications))
    return null

  const subscriptionId = author.subscribedBy.nodes.find((n) => n.active)?.id

  return (
    <div
      className={css({
        marginTop: 4,
        pt: 4,
        borderTopStyle: 'solid',
        borderTopWidth: '1px',
        borderTopColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        position: 'relative',
        cursor: 'pointer',
        md: {
          gap: 4,
          px: 4,
        },
      })}
    >
      {contributor.portrait && (
        <img
          src={urlFor(contributor.portrait).width(250).height(250).url()}
          width='84'
          height='84'
          className={css({
            borderRadius: '96px',
          })}
          alt=''
        />
      )}
      <div>
        <h4 className={css({ fontWeight: 'bold', lineHeight: '1.2' })}>
          <Link href={`/~${contributor.slug}`} className={linkOverlay()}>
            {contributor.name}
          </Link>
        </h4>
        {!!contributor.description && (
          <p
            className={css({
              fontSize: 'sm',
              color: 'textSoft',
              lineHeight: '1.2',
              wordBreak: 'break-word',
            })}
          >
            {contributor.description}
          </p>
        )}
      </div>
      <div
        className={css({ ml: 'auto', position: 'relative', zIndex: 10, pl: 2 })}
      >
        <FollowButton
          type={SubscriptionObjectType.User}
          subscriptionId={subscriptionId}
          objectId={contributor.userId}
          objectName={contributor.name}
        />
      </div>
    </div>
  )
}

export default FollowContributorCard
