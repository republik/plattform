import { ChallengeAcceptedHubQueryQuery } from '@app/graphql/gql/graphql'
import { css } from '@app/styled-system/css'
import { vstack } from '@app/styled-system/patterns'
import { ArticleTeaser } from './teasers/article-teaser'
import { EventTeaser } from './teasers/event-teaser'
import { NewsletterTeaser } from './teasers/newsletter-teaser'

type CollectionRendererProps = {
  items: ChallengeAcceptedHubQueryQuery['hub']['items']
  isMember?: boolean
  filter?: string
}

export default function CollectionRenderer({
  items,
  isMember = false,
  filter,
}: CollectionRendererProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className={css({ width: 'full' })}>
      <ul
        className={vstack({
          gap: '6',
          listStyle: 'none',
          alignItems: 'stretch',
        })}
      >
        {items.map((item) => {
          if (
            item.__typename === 'ChallengeAcceptedNewsletterRecord' &&
            (!filter || filter === 'all' || filter === 'newsletter')
          ) {
            return (
              <li key={item.id}>
                <NewsletterTeaser {...item} />
              </li>
            )
          } else if (
            item.__typename === 'ChallengeAcceptedArticleRecord' &&
            (!filter || filter === 'all' || filter === 'article')
          ) {
            return (
              <li key={item.id}>
                <ArticleTeaser {...item} />
              </li>
            )
          } else if (
            item.__typename === 'EventRecord' &&
            (!filter || filter === 'all' || filter === 'event')
          ) {
            return (
              <li key={item.id}>
                <EventTeaser event={item} isMember={isMember} />
              </li>
            )
          }
        })}
      </ul>
    </div>
  )
}
