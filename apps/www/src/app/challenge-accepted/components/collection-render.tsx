import { css } from '@app/styled-system/css'
import { Collapsible } from './collapsible'
import { ArticleTeaser } from './teasers/article-teaser'
import { EventTeaser } from './teasers/event-teaser'
import { NewsletterTeaser } from './teasers/newsletter-teaser'
import { ChallengeAcceptedHubQuery } from '@app/graphql/cms/gql/graphql'

type CollectionRendererProps = {
  items: ChallengeAcceptedHubQuery['hub']['items']
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

  const renderedItems = items
    .map((item) => {
      if (
        item.__typename === 'ChallengeAcceptedNewsletterRecord' &&
        (!filter || filter === 'all' || filter === 'newsletter')
      ) {
        return (
          <div data-item key={item.id}>
            <NewsletterTeaser {...item} />
          </div>
        )
      } else if (
        item.__typename === 'ChallengeAcceptedArticleRecord' &&
        (!filter || filter === 'all' || filter === 'article')
      ) {
        return (
          <div data-item key={item.id}>
            <ArticleTeaser {...item} />
          </div>
        )
      } else if (
        item.__typename === 'EventRecord' &&
        (!filter || filter === 'all' || filter === 'event')
      ) {
        return (
          <div data-item key={item.id}>
            <EventTeaser event={item} isMember={isMember} />
          </div>
        )
      }
    })
    .filter(Boolean)

  const shownItems = renderedItems.slice(0, 5)
  const collapsedItems = renderedItems.slice(5)

  return (
    <div
      className={css({
        width: 'full',
        '& [data-item]': {
          mb: '6',
        },
        '& [data-collapsible-trigger]': {
          color: 'contrast',
          cursor: 'pointer',
          textAlign: 'center',
          width: 'full',
          mt: '-2',
        },
      })}
    >
      {collapsedItems.length > 0 ? (
        <Collapsible
          shownItems={renderedItems.slice(0, 5)}
          collapsedItems={renderedItems.slice(5, -1)}
        />
      ) : (
        shownItems
      )}
    </div>
  )
}
