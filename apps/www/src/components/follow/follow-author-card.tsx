import {
  FollowableAuthorDocument,
  SubscriptionObjectType,
  User,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { FollowButton } from '@app/components/follow/follow-button'
import { css } from '@republik/theme/css'
import { linkOverlay } from '@republik/theme/patterns'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function FollowAuthorCard({ authorId }: { authorId: string }) {
  const { data } = useQuery(FollowableAuthorDocument, {
    variables: { id: authorId },
  })

  const author = data?.user as User

  if (!author) return null

  const subscriptionId = author.subscribedBy.nodes.find((n) => n.active)?.id

  function getDescription(user: User) {
    const verifiedRole = user.credentials?.find(
      (cred) => cred.isListed && cred.verified,
    )
    if (verifiedRole) {
      return verifiedRole.description
    }
    const listedRole = user.credentials?.find((cred) => cred.isListed)
    if (listedRole) {
      return listedRole.description
    }
    return ''
  }

  const authorDescription = getDescription(author)

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
        gap: 4,
        position: 'relative',
        cursor: 'pointer',
      })}
    >
      {author.portrait && (
        <Image
          width='84'
          height='84'
          className={css({
            borderRadius: '96px',
          })}
          src={author.portrait}
          alt=''
        />
      )}
      <div>
        <h4 className={css({ fontWeight: 'bold' })}>
          <Link href={`/~${author.slug}`} className={linkOverlay()}>
            {author.name}
          </Link>
        </h4>
        {!!authorDescription && (
          <p className={css({ fontSize: 'sm', color: 'textSoft', mt: 1 })}>
            {authorDescription}
          </p>
        )}
      </div>
      <div className={css({ ml: 'auto', position: 'relative', zIndex: 10 })}>
        <FollowButton
          type={SubscriptionObjectType.User}
          subscriptionId={subscriptionId}
          objectId={authorId}
          objectName={author.name}
        />
      </div>
    </div>
  )
}

export default FollowAuthorCard
