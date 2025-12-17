import { getFragmentData } from '#graphql/republik-api/__generated__/gql'
import {
  SubscriptionFieldsFragment,
  SubscriptionFieldsUserFragment,
  SubscriptionFieldsUserFragmentDoc,
  SubscriptionObjectType,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { FollowButton } from '@app/components/follow/follow-button'
import { css } from '@republik/theme/css'

function FollowAuthorCard({
  subscription,
}: {
  subscription: SubscriptionFieldsFragment
}) {
  if (!subscription) {
    return null
  }

  const author =
    subscription.object.__typename === 'User' &&
    getFragmentData(SubscriptionFieldsUserFragmentDoc, subscription.object)

  const subscriptionId = subscription.active && subscription.id

  // fallback if there is no hardcoded beat in translation.js
  function getDescription(author: SubscriptionFieldsUserFragment) {
    const verifiedRole = author.credentials?.find(
      (cred) => cred.isListed && cred.verified,
    )
    if (verifiedRole) {
      return verifiedRole.description
    }
    const listedRole = author.credentials?.find((cred) => cred.isListed)
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
        borderTopColor: 'text',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      })}
    >
      <img
        width='84'
        height='84'
        className={css({
          borderRadius: '96px',
          backgroundColor: 'divider',
        })}
        src={author.portrait}
      />
      <div>
        <h4 className={css({ fontWeight: 'bold' })}>{author.name}</h4>
        <p className={css({ fontSize: 'sm' })}>{getDescription(author)}</p>
        <div
          className={css({
            display: 'block',
            mt: 2,
          })}
        >
          <FollowButton
            subscriptionId={subscriptionId}
            objectId={author.id}
            type={SubscriptionObjectType.User}
          />
        </div>
      </div>
    </div>
  )
}

export default FollowAuthorCard
