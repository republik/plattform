import {
  ArticleQueryResult,
  ARTICLE_QUERY,
} from '@app/graphql/republik-api/article.query'
import { getClient } from '@app/lib/apollo/client'
import { css } from '@app/styled-system/css'
import Link from 'next/link'

type NewsletterProps = {
  path: string
}

export const NewsletterTeaser = async ({ path }: NewsletterProps) => {
  const { data }: { data: ArticleQueryResult } = await getClient().query({
    query: ARTICLE_QUERY,
    variables: { path },
  })

  const { article } = data

  if (!article) {
    return null
  }

  return (
    <Link
      href={path}
      className={css({ color: 'text', textDecoration: 'none' })}
    >
      <div
        className={css({
          padding: '6',
          background: 'overlay',
        })}
      >
        <p>Newsletter</p>
        <h3 className={css({ textStyle: 'newsletterTeaserTitle', mb: '4' })}>
          {article.meta.title}
        </h3>
        <p className={css({ textStyle: 'teaserLeadSans' })}>
          {article.meta.shortTitle}
        </p>
      </div>
    </Link>
  )
}
