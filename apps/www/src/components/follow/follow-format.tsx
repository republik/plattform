'use client'

import { FollowableDocumentDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import FollowFormatCard from '@app/components/follow/follow-format-card'
import { type NewsletterName } from '@app/components/newsletters/config'
import NewsletterArticleCard from '@app/components/newsletters/newsletter-article-card'

function FollowFormat({ path, button }: { path: string; button?: boolean }) {
  const { data } = useQuery(FollowableDocumentDocument, {
    variables: { path },
  })
  const format = data?.document

  if (!format) return null

  // Newsletters are handled by a special newsletter component
  // They can be subscribed to, even with users are anonymous.
  const newsletter = format.meta?.newsletter
  if (newsletter)
    return (
      <NewsletterArticleCard
        newsletter={newsletter.name as NewsletterName}
        path={path}
        button={button}
      />
    )

  return <FollowFormatCard format={format} button={button} />
}

export default FollowFormat
