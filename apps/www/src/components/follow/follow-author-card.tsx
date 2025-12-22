import {
  FollowableAuthorDocument,
  SubscriptionObjectType,
  User,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { FollowButton } from '@app/components/follow/follow-button'
import { css } from '@republik/theme/css'
import Image from 'next/image'

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
        <h4 className={css({ fontWeight: 'bold' })}>{author.name}</h4>
        <p className={css({ fontSize: 'sm', color: 'textSoft', mt: 1 })}>
          {getDescription(author)}
        </p>
        <div
          className={css({
            display: 'block',
            mt: 2,
          })}
        ></div>
      </div>
      <div className={css({ ml: 'auto' })}>
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
