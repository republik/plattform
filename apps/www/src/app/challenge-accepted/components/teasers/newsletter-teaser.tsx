import { ArticleTeaserDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { getClient } from '@app/lib/apollo/client'
import { getMe } from '@app/lib/auth/me'
import { css } from '@republik/theme/css'
import Link from 'next/link'

type NewsletterProps = {
  path: string
}

export const NewsletterTeaser = async ({ path }: NewsletterProps) => {
  const client = await getClient()
  const { data } = await client.query({
    query: ArticleTeaserDocument,
    variables: { path },
  })

  const { article } = data

  if (!article) {
    const { me } = await getMe()

    // Show warning to editors
    if (
      me?.roles.some((role) =>
        ['editor', 'moderator', 'admin'].includes(role),
      ) ||
      process.env.NODE_ENV === 'development'
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
          Beitrag nicht gefunden: {path}
        </div>
      )
    }
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
