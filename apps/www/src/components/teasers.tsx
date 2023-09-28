import {
  ARTICLE_QUERY,
  ArticleQueryResult,
} from '@app/graphql/republik-api/article.query'
import { getClient } from '@app/lib/apollo/client'
import { css } from '@app/styled-system/css'
import Link from 'next/link'
import { isoParse, timeFormat } from 'd3-time-format'
import Image from 'next/image'

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

type ArticleProps = {
  path: string
}

export const TeaserArticle = async ({ path }: ArticleProps) => {
  const { data }: { data: ArticleQueryResult } = await getClient().query({
    query: ARTICLE_QUERY,
    variables: { path },
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
          '&:hover': { transform: 'scale(1.02)' },
        })}
      >
        {article.meta.image ? (
          <Image
            alt=''
            src={getResizedImageSrc(article.meta.image, 1500)}
            {...getOriginalImageDimensions(article.meta.image)}
            className={css({ width: 'full', height: 'auto' })}
          />
        ) : null}
        <div className={css({ padding: '6' })}>
          <p>Artikel</p>
          <h3 className={css({ textStyle: 'headingSansMedium', mb: '1' })}>
            {article.meta.title}
          </h3>
          <p>{article.meta.shortTitle}</p>
        </div>
      </div>
    </Link>
  )
}

type NewsletterProps = {
  path: string
}

export const TeaserNewsletter = async ({ path }: NewsletterProps) => {
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
        <h3 className={css({ textStyle: 'headingSansMedium', mb: '1' })}>
          {article.meta.title}
        </h3>
        <p>{article.meta.shortTitle}</p>
      </div>
    </Link>
  )
}

const formatDate = timeFormat('%d.%m.%y')

type EventProps = { title: string; startAt: string; location: string }

export const TeaserEvent = ({ title, startAt, location }: EventProps) => {
  return (
    <div
      className={css({
        padding: '6',
        // background: 'challengeAccepted.white',
        borderColor: 'contrast',
        borderStyle: 'solid',
        borderWidth: 1,
        color: 'contrast',
      })}
    >
      <h3
        className={css({
          textStyle: 'headingSans',
          textAlign: 'center',
          fontSize: '4xl',
          mb: '6',
        })}
      >
        {formatDate(isoParse(startAt))}
      </h3>
      <div className={css({ color: 'text' })}>
        <h4 className={css({ textStyle: 'headingSansMedium' })}>{title}</h4>
        <p className={css({})}>Ort: {location}</p>
      </div>
    </div>
  )
}
