import { getFragmentData } from '#graphql/republik-api/__generated__/gql'
import {
  FollowArticleDocument,
  SubscriptionFieldsFragment,
  SubscriptionFieldsFragmentDoc,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import FollowAuthor from '@app/components/follow/follow-author'
import { ArticleSection } from '@app/components/ui/section'

function FollowAuthors({
  subscriptions,
}: {
  subscriptions: SubscriptionFieldsFragment[]
}) {
  if (subscriptions?.length === 0) return null

  return (
    <ArticleSection>
      {subscriptions.map((sub) => (
        <FollowAuthor key={sub.id} subscription={sub} />
      ))}
    </ArticleSection>
  )
}

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
  // if series: show series follow
  // if format: show format follow
  // else show auhtors follow
  return (
    <div>
      <FollowAuthors subscriptions={authorsSubscription} />
    </div>
  )
}

export default FollowArticle
