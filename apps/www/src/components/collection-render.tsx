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
}

export default function CollectionRenderer({ items }: CollectionRendererProps) {
  if (items.length === 0) {
    return 'Leider noch nix'
  }

  return (
    <div className={css({ width: '100%' })}>
      <ul
        className={vstack({
          gap: '4',
          listStyle: 'none',
          alignItems: 'stretch',
        })}
      >
        {items.map((item) => {
          if (item.__typename === 'NewsletterRecord') {
            return (
              <li key={item.id}>
                <TeaserNewsletter {...item} />
              </li>
            )
          } else if (item.__typename === 'ArticleRecord') {
            return (
              <li key={item.id}>
                <TeaserArticle {...item} />
              </li>
            )
          } else if (item.__typename === 'EventRecord') {
            return (
              <li key={item.id}>
                <TeaserEvent {...item} />
              </li>
            )
          }
        })}
      </ul>
    </div>
  )
}
