import { getFragmentData } from '#graphql/republik-api/__generated__/gql'
import {
  FollowArticleDocument,
  SubscriptionFieldsFragmentDoc,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import FollowAuthors from '@app/components/follow/follow-authors'
import FollowFormat from '@app/components/follow/follow-format'

function FollowArticle({ path }: { path: string }) {
  const { data } = useQuery(FollowArticleDocument, {
    variables: { path },
  })

  if (!data) return null

  const subscriptions = data.article.subscribedBy?.nodes?.map((subscription) =>
    getFragmentData(SubscriptionFieldsFragmentDoc, subscription),
  )
  const authorsSubscription = subscriptions?.filter(
    (sub) => sub.isEligibleForNotifications && sub.object.__typename === 'User',
  )

  const formatSubscription = subscriptions?.find(
    (sub) =>
      sub.isEligibleForNotifications && sub.object.__typename === 'Document',
  )

  // if series: show series follow

  if (formatSubscription) {
    return <FollowFormat subscription={formatSubscription} />
  }

  return <FollowAuthors subscriptions={authorsSubscription} />
}

export default FollowArticle
