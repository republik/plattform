import {
  ARTICLE_QUERY,
  ArticleQueryResult,
} from '@app/graphql/republik-api/article.query'
import { getClient } from '@app/lib/apollo/client'
import { css } from '@app/styled-system/css'
import Link from 'next/link'
import Image from 'next/image'
import formatCredits from 'components/Feed/formatCredits'
import { matchType, renderMdast } from '@republik/mdast-react-render'

const getResizefromURL = (url, size) => {
  const imgURL = new URL(url)
  const sizeString = imgURL.searchParams.get('size')
  if (!sizeString) {
    return `${size}x`
  }

  const [w, h] = sizeString.split('x')

  if (w >= h) {
    return `x${size}`
  }

  return `${size}x`
}

const getResizedImageSrc = (url, width) => {
  const imgURL = new URL(url)
  imgURL.searchParams.set('resize', `${width}x`)
  return imgURL.toString()
}
const getOriginalImageDimensions = (url) => {
  const imgURL = new URL(url)
  const sizeString = imgURL.searchParams.get('size')
  const [width, height] = sizeString ? sizeString.split('x') : [1, 1]

  return { width: +width ?? 1, height: +height ?? 1 }
}

// Start: Copied from styleguide TeaserFeed component with slight adaptations

const creditsSchema = {
  rules: [
    {
      matchMdast: matchType('link'),
      props: (node) => ({
        title: node.title,
        href: node.url,
      }),
      component: ({ children, href }) => {
        if (href) return <Link href={href}>{children}</Link>
        return <span>{children}</span>
      },
    },
    {
      matchMdast: matchType('break'),
      component: () => <br />,
      isVoid: true,
    },
  ],
}

// End: Copied from styleguide TeaserFeed component with slight adaptations

type ArticleProps = {
  path: string
}

export const ArticleTeaser = async ({ path }: ArticleProps) => {
  // To support path with query params, we use the URL API
  // and extract the pathname from it.
  const url = new URL(path, process.env.NEXT_PUBLIC_BASE_URL)

  const { data }: { data: ArticleQueryResult } = await getClient().query({
    query: ARTICLE_QUERY,
    variables: { path: url.pathname },
  })

  const { article } = data

  if (!data.article) {
    return null
  }

  return (
    <Link
      href={path}
      className={css({ color: 'text.white', textDecoration: 'none' })}
    >
      <div
        className={css({
          background: 'challengeAccepted.blue',
          color: 'text.white',
        })}
      >
        {article.meta.image ? (
          <Image
            alt=''
            src={getResizedImageSrc(article.meta.image, 1500)}
            {...getOriginalImageDimensions(article.meta.image)}
            className={css({
              width: 'full',
              height: 'auto',
              objectFit: 'contain',
            })}
            unoptimized // Don't process with /_next/image route
          />
        ) : null}
        <div
          className={css({
            p: '12',
            textAlign: 'center',
            textStyle: 'serif',
          })}
        >
          <h3 className={css({ textStyle: 'teaserTitle', mb: '4' })}>
            {article.meta.title}
          </h3>
          <p className={css({ textStyle: 'teaserLead' })}>
            {article.meta.shortTitle}
          </p>
          <p
            className={css({
              mt: '4',
              '& > a': {
                color: 'text.white',
                textDecoration: 'underline',
              },
            })}
          >
            {renderMdast(formatCredits(article.meta.credits), creditsSchema)}
          </p>
        </div>
      </div>
    </Link>
  )
}
