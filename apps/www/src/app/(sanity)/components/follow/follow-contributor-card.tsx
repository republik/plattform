import { SubscriptionObjectType } from '#graphql/republik-api/__generated__/gql/graphql'
import { FollowButton } from '@/app/(sanity)/components/follow/follow-button'
import { css } from '@republik/theme/css'
import { linkOverlay } from '@republik/theme/patterns'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function FollowContributorCard({ contributor }) {
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
        <Image
          width='84'
          height='84'
          className={css({
            borderRadius: '96px',
          })}
          src={contributor.portrait}
          alt=''
        />
      )}
      <div>
        <h4 className={css({ fontWeight: 'bold', lineHeight: '1.2' })}>
          <Link href={`/~${contributor.userId}`} className={linkOverlay()}>
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
        <FollowButton type={SubscriptionObjectType.User} />
      </div>
    </div>
  )
}

export default FollowContributorCard
