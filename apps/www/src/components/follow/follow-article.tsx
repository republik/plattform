import { Document } from '#graphql/republik-api/__generated__/gql/graphql'
import FollowAuthors from '@app/components/follow/follow-authors'
import FollowFormat from '@app/components/follow/follow-format'

type ContributorType = {
  kind: string
  user?: {
    id: string
  }
}

function FollowArticle({
  contributors,
  format,
}: {
  contributors?: ContributorType[]
  format?: Document
}) {
  console.log(format)
  if (format) {
    return <FollowFormat format={format} />
  }

  const authorIds = contributors
    ?.filter((contributor) => contributor.kind === 'Text')
    .map((contributor) => contributor.user?.id)
    .filter(Boolean)

  return <FollowAuthors authorIds={authorIds} />
}

export default FollowArticle
