import {
  ARTICLE_QUERY,
  ArticleQueryResult,
} from '@app/graphql/republik-api/article.query'
import { getClient } from '@app/lib/apollo/client'
import { css } from '@app/styled-system/css'
import Link from 'next/link'

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
  const [width, height] = sizeString ? sizeString.split('x') : ['1', '1']

  return { width: width ?? '1', height: height ?? '1' }
}

type ArticleProps = {
  path: string
}

export const TeaserArticle = async ({ path }: ArticleProps) => {
  const { data }: { data: ArticleQueryResult } = await getClient().query({
    query: ARTICLE_QUERY,
    variables: { path },
  })

  if (!data.article) {
    return null
  }

  return (
    <Link href={path}>
      <div
        className={css({
          background: 'challengeAccepted.teaserBackground',
          color: 'text.inverted',
          '&:hover': { transform: 'scale(1.02)' },
        })}
      >
        {data.article?.meta.image ? (
          <img
            src={getResizedImageSrc(data.article?.meta.image, 1500)}
            {...getOriginalImageDimensions(data.article?.meta.image)}
            className={css({ width: '100%', height: 'auto' })}
          ></img>
        ) : null}
        <div className={css({ padding: '4' })}>
          <p className={css({ textStyle: 'xs' })}>Artikel</p>
          <h3 className={css({ textStyle: 'xl' })}>
            {data.article?.meta.title}
          </h3>
          <p className={css({ textStyle: 'sm' })}>
            {data.article?.meta.shortTitle}
          </p>
        </div>
      </div>
    </Link>
  )
}

type NewsletterProps = {
  repoid: string
}

export const TeaserNewsletter = ({ repoid }: NewsletterProps) => {
  return (
    <div
      className={css({
        padding: '4',
        background: 'challengeAccepted.teaserBackground',
        color: 'text.inverted',
      })}
    >
      <p className={css({ textStyle: 'xs' })}>Newsletter</p>
      <h3 className={css({ textStyle: 'xl' })}>{repoid}</h3>
    </div>
  )
}

type EventProps = { title: string }

export const TeaserEvent = ({ title }: EventProps) => {
  return (
    <div
      className={css({
        padding: '4',
        background: 'challengeAccepted.teaserBackground',
        color: 'text.inverted',
      })}
    >
      <p className={css({ textStyle: 'xs' })}>Veranstaltung</p>
      <h3 className={css({ textStyle: 'xl' })}>{title}</h3>
    </div>
  )
}
