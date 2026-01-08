import { Document } from '#graphql/republik-api/__generated__/gql/graphql'
import FollowAuthors from '@app/components/follow/follow-authors'
import FollowFormat from '@app/components/follow/follow-format'

type ContributorType = {
  kind: string
  user?: {
    id: string
  }
}

const mdastToString = (node) =>
  node
    ? node.value ||
      (node.children && node.children.map(mdastToString).join('')) ||
      ''
    : ''

function FollowArticle({
  contributors,
  format,
}: {
  contributors?: ContributorType[]
  format?: Document
}) {
  if (format) {
    return <FollowFormat path={format.meta.path} />
  }

  const authorIds = contributors
    ?.filter((contributor) => contributor.kind === 'Text')
    .map((contributor) => contributor.user?.id)
    .filter(Boolean)

  return <FollowAuthors authorIds={authorIds} />
}

export default FollowArticle
