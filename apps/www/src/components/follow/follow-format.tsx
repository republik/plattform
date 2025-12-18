import { SubscriptionFieldsFragment } from '#graphql/republik-api/__generated__/gql/graphql'
import { ArticleSection } from '@app/components/ui/section'
import { css } from '@republik/theme/css'

function FollowFormat({
  subscription,
}: {
  subscription: SubscriptionFieldsFragment
}) {
  if (!subscription) return null

  return (
    <div className={css({ marginTop: 8 })}>
      <ArticleSection>Follow FORMAT</ArticleSection>
    </div>
  )
}

export default FollowFormat
