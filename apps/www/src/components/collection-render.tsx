'use client'
import { ChallengeAcceptedHubQueryQuery } from '@app/graphql/gql/graphql'
import { css } from '@app/styled-system/css'

type CollectionRendererProps = {
  items: ChallengeAcceptedHubQueryQuery['hub']['items']
}

export default function CollectionRenderer({ items }: CollectionRendererProps) {
  return (
    <div
      className={css({
        my: 8,
      })}
    >
      <h2 className={css({ textStyle: '3xl', mb: 4 })}>CollectionRenderer</h2>
      <ul
        className={css({
          listStyle: 'disc',
        })}
      >
        {items.map((item) => {
          if (item.__typename === 'NewsletterRecord') {
            return (
              <li key={item.id}>
                <h3>
                  <b>Newsletter</b> {item.repoid}
                </h3>
              </li>
            )
          } else if (item.__typename === 'ArticleRecord') {
            return (
              <li key={item.id}>
                <h3>
                  <b>Article</b> {item.repoid}
                </h3>
              </li>
            )
          } else if (item.__typename === 'EventRecord') {
            const { id, title, ...rest } = item
            return (
              <li key={id}>
                <h3>
                  <b>Event</b> - {title}
                </h3>
                <details>
                  <summary>rest</summary>
                  <pre>{JSON.stringify(rest, null, 2)}</pre>
                </details>
              </li>
            )
          }
        })}
      </ul>
    </div>
  )
}
