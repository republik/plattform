import { getClient } from '@app/lib/apollo/client'
import { css } from '@republik/theme/css'
import Link from 'next/link'
import Image from 'next/image'
import formatCredits from 'components/Feed/formatCredits'
import { vstack } from '@republik/theme/patterns'

import { renderMdast } from '@app/lib/mdast/render'
import { getMe } from '@app/lib/auth/me'
import {
  ArticleTeaserDocument,
  ArticleTeaserQuery,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { PUBLIC_BASE_URL } from 'lib/constants'

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

  return { width: +width || 1, height: +height || 1 }
}

// Start: Copied from styleguide TeaserFeed component with slight adaptations
const matchType = (type) => (node) => node.type === type
const creditsSchema = {
  rules: [
    {
      matchMdast: matchType('link'),
      props: (node) => ({
        title: node.title,
        href: node.url,
      }),
      component: ({ children }) => {
        // Don't render as links because <a> cannot be nested (article teaser is already one)
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
  image?: { url: string; height?: number; width?: number }
}

export const ArticleTeaser = async ({ path, image }: ArticleProps) => {
  // To support path with query params, we use the URL API
  // and extract the pathname from it.
  const url = new URL(path, PUBLIC_BASE_URL)

  const client = await getClient()
  const { data } = await client.query<ArticleTeaserQuery>({
    query: ArticleTeaserDocument,
    variables: { path: url.pathname },
  })

  const { article } = data

  if (!data.article) {
    const { me } = await getMe()

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
          Beitrag nicht gefunden: {path}
        </div>
      )
    }
    return null
  }

  const overrideImage = !!image

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
        {overrideImage ? (
          <Image
            alt=''
            src={image.url}
            width={image.width}
            height={image.height}
            className={css({
              width: 'full',
              height: 'auto',
              objectFit: 'contain',
            })}
          />
        ) : (
          <>
            {article.meta.image && (
              <Image
                alt=''
                src={getResizedImageSrc(article.meta.image, 1500)}
                {...getOriginalImageDimensions(article.meta.image)}
                className={css({
                  width: 'full',
                  height: 'auto',
                  objectFit: 'contain',
                })}
                unoptimized
              />
            )}
          </>
        )}
        <div
          className={vstack({
            gap: '4',
            p: { base: '8', md: '12' },
            textAlign: 'center',
            textStyle: 'serif',
          })}
        >
          <h3 className={css({ textStyle: 'teaserTitle' })}>
            {article.meta.title}
          </h3>
          <p className={css({ textStyle: 'teaserLead' })}>
            {article.meta.description}
          </p>
          <p
            className={css({
              textStyle: 'teaserCredits',
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
