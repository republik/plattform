import {
  TeaserArticle,
  TeaserEvent,
  TeaserNewsletter,
} from '@app/components/teasers'
import { ChallengeAcceptedHubQueryQuery } from '@app/graphql/gql/graphql'
import { css } from '@app/styled-system/css'
import { vstack } from '@app/styled-system/patterns'

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
    return 'Leider noch nix'
  }

  return (
    <div className={css({ width: 'full' })}>
      <ul
        className={vstack({
          gap: '4',
          listStyle: 'none',
          alignItems: 'stretch',
        })}
      >
        {items.map((item) => {
          if (
            item.__typename === 'NewsletterRecord' &&
            (!filter || filter === 'all' || filter === 'newsletter')
          ) {
            return (
              <li key={item.id}>
                <TeaserNewsletter {...item} />
              </li>
            )
          } else if (
            item.__typename === 'ArticleRecord' &&
            (!filter || filter === 'all' || filter === 'article')
          ) {
            return (
              <li key={item.id}>
                <TeaserArticle {...item} />
              </li>
            )
          } else if (
            item.__typename === 'EventRecord' &&
            (!filter || filter === 'all' || filter === 'event')
          ) {
            return (
              <li key={item.id}>
                <TeaserEvent event={item} isMember={isMember} />
              </li>
            )
          }
        })}
      </ul>
    </div>
  )
}
