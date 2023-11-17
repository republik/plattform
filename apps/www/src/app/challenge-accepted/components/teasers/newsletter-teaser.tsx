import {
  ArticleQueryResult,
  ARTICLE_QUERY,
} from '@app/graphql/republik-api/article.query'
import { getClient } from '@app/lib/apollo/client'
import { getMe } from '@app/lib/auth/me'
import { css } from '@app/styled-system/css'
import Link from 'next/link'

type NewsletterProps = {
  repoId?: string // TODO: make required, once it's required in Dato CMS
}

export const NewsletterTeaser = async ({ repoId }: NewsletterProps) => {
  const { data }: { data: ArticleQueryResult } = await getClient().query({
    query: ARTICLE_QUERY,
    variables: { repoId },
  })

  const article = data.article.nodes[0]

  if (!article) {
    const me = await getMe()

    // Show warning to editors
    if (
      me?.roles.some((role) => ['editor', 'moderator', 'admin'].includes(role))
    ) {
      return (
        <div
          className={css({
            background: 'hotpink',
            textStyle: 'h1Sans',
            fontWeight: 'bold',
            p: '4',
          })}
        >
          Newsletter nicht gefunden: {repoId}
        </div>
      )
    }
    return null
  }
  return (
    <Link
      href={article.meta.path}
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
        <p className={css({ textStyle: 'teaserLeadSans', mb: '4' })}>
          {article.meta.description}
        </p>
        <p
          className={css({
            // textStyle: 'teaserLeadSans',
            textDecoration: 'underline',
          })}
        >
          Weiterlesen
        </p>
      </div>
    </Link>
  )
}
