import {
  ARTICLE_QUERY,
  ArticleQueryResult,
} from '@app/graphql/republik-api/article.query'
import { getClient } from '@app/lib/apollo/client'
import { css } from '@app/styled-system/css'
import Link from 'next/link'
import { isoParse, timeFormat } from 'd3-time-format'
import Image from 'next/image'
import { StructuredText } from 'react-datocms'
import { ComponentPropsWithoutRef } from 'react'

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
          '&:hover': { transform: 'scale(1.02)' },
        })}
      >
        <p>Path: {path}</p>
        <p>
          Url: {url.toString()} ({url.pathname})
        </p>
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
        <h3 className={css({ textStyle: 'h2Sans', mb: '1' })}>
          {article.meta.title}
        </h3>
        <p>{article.meta.shortTitle}</p>
      </div>
    </Link>
  )
}

const formatDate = timeFormat('%d.%m.%y')
const formateTime = timeFormat('%H:%M')

type EventProps = {
  event: {
    title: string
    description?: {
      value: ComponentPropsWithoutRef<typeof StructuredText>['data']
    }
    isPublic?: boolean
    nonMemberCta?: {
      value: ComponentPropsWithoutRef<typeof StructuredText>['data']
    }
    location: string
    startAt: string
    endAt?: string
    signUpLink?: string
    fullyBooked?: boolean
  }
  isMember: boolean
}

export const TeaserEvent = ({ event, isMember }: EventProps) => {
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
          textStyle: 'eventTeaserTitle',
          textAlign: 'center',
          mb: '6',
        })}
      >
        {formatDate(isoParse(event.startAt))}
      </h3>
      <div
        className={css({
          color: 'text',
          display: 'flex',
          flexDirection: 'column',
          gap: '4',
        })}
      >
        <h4 className={css({ textStyle: 'h2Sans' })}>
          {event.title} {event.fullyBooked && '(ausgebucht)'}
        </h4>
        <p className={css({})}>
          {formateTime(isoParse(event.startAt))} -{' '}
          {event.endAt ? formateTime(isoParse(event.endAt)) : 'offen'} /{' '}
          {event.location}
        </p>
        <StructuredText data={event.description.value} />
        {!event.fullyBooked && (
          <>
            {!isMember && !event.isPublic ? (
              <p>
                {event.nonMemberCta && (
                  <StructuredText data={event.nonMemberCta.value} />
                )}
              </p>
            ) : (
              <>
                {event.signUpLink && (
                  <Link target='_blank' href={event.signUpLink}>
                    Zur Anmeldung
                  </Link>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
