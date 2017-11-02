import React from 'react'
import {css} from 'glamor'
import { timeFormatLocale } from 'd3-time-format'
import timeDefinition from 'd3-time-format/locale/de-CH'
import { imageResizeUrl } from '../utils'

import { H3 } from './Headlines'
import P from './Paragraph'

const timeFormat = timeFormatLocale(timeDefinition).format

const containerStyle = css({
  height: '100%',
  backgroundColor: '#f2f2f2',
  maxWidth: 290
})
const imageStyle = css({
  display: 'block',
  '& img': {
    width: '100%'
  }
})
const textStyle = css({
  display: 'block',
  padding: '5px 10px 10px',
  textDecoration: 'none',
  '& p': {
    marginBottom: 0
  }
})

const parseDate = string => {
  const date = new Date(string)
  return isNaN(date) ? undefined : date
}
const formatPublishDate = timeFormat('%d. %B %Y')

const CardLink = ({slug, href, children}) => children

const Card = ({slug, href, title, publishDate, image, imageAlt, Link = CardLink}) => {
  let parsedDate = parseDate(publishDate)
  return (
    <div {...containerStyle}>
      <Link href={href} slug={slug}>
        <a {...imageStyle}>
          <img src={imageResizeUrl(image, '580x326')} alt={imageAlt} />
        </a>
      </Link>
      <Link href={href} slug={slug}>
        <a {...textStyle}>
          <H3>{title}</H3>
          {!!parsedDate && <P>{formatPublishDate(parsedDate)}</P>}
        </a>
      </Link>
    </div>
  )
}

export default Card
