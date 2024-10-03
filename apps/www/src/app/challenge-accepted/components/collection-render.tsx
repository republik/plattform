import { css } from '@republik/theme/css'
import { Collapsible } from './collapsible'
import { ArticleTeaser } from './teasers/article-teaser'
import { EventTeaser } from './teasers/event-teaser'
import { NewsletterTeaser } from './teasers/newsletter-teaser'
import { ChallengeAcceptedHubQuery } from '#graphql/cms/__generated__/gql/graphql'

type CollectionRendererProps = {
  highlights: ChallengeAcceptedHubQuery['hub']['items']
  newsletters?: ChallengeAcceptedHubQuery['allNewsletters']
  events?: ChallengeAcceptedHubQuery['challengeAcceptedTag']['events']
  isMember?: boolean
  filter?: string
}

export default function CollectionRenderer({
  highlights,
  newsletters = [],
  events = [],
  isMember = false,
  filter,
}: CollectionRendererProps) {
  const items =
    filter === 'event'
      ? events
      : filter === 'newsletter'
      ? newsletters
      : highlights

  if (items.length === 0) {
    return null
  }

  const renderedItems = items
    .map((item) => {
      if (item.__typename === 'ChallengeAcceptedNewsletterRecord') {
        return (
          <div data-item key={item.id}>
            <NewsletterTeaser {...item} />
          </div>
        )
      } else if (item.__typename === 'ChallengeAcceptedArticleRecord') {
        return (
          <div data-item key={item.id}>
            <ArticleTeaser {...item} />
          </div>
        )
      } else if (item.__typename === 'EventRecord') {
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
