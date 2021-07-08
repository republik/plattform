import React from 'react'
import { css } from 'glamor'
import { timeFormat } from 'd3-time-format'

import { Sub, Sup } from '../../components/Typography'
import { mUp } from '../../theme/mediaQueries'

import {
  matchType,
  matchZone,
  matchImage,
  matchParagraph,
  matchImageParagraph
} from 'mdast-react-render/lib/utils'

import { FIGURE_SIZES } from '../../components/Figure'
import { PULLQUOTE_IMAGE_SIZE } from '../../components/PullQuote'
import {
  INFOBOX_IMAGE_SIZES,
  INFOBOX_DEFAULT_IMAGE_SIZE
} from '../../components/InfoBox'

export const matchSpan = matchType('span')
export const matchSpanType = type => node =>
  matchSpan(node) && node.data?.type === type

export const matchInfoBox = matchZone('INFOBOX')
export const matchQuote = matchZone('QUOTE')
export const matchFigure = matchZone('FIGURE')

export const matchLast = (node, index, parent) =>
  index === parent.children.length - 1
export const matchTeaser = matchZone('TEASER')
export const matchTeaserGroup = matchZone('TEASERGROUP')
export const matchTeaserType = teaserType => node =>
  matchTeaser(node) && node.data.teaserType === teaserType

export const matchImagesParagraph = node =>
  matchImageParagraph(node) ||
  (matchParagraph(node) &&
    node.children.length === 3 &&
    matchImage(node.children[0]) &&
    matchImage(node.children[2]))

export const extractImage = node =>
  matchImageParagraph(node) ? node.children[0].url : undefined

export const extractImages = (node, prop = 'src') => {
  if (!matchImagesParagraph(node)) return undefined
  const urls = node.children.filter(matchImage).map(child => child.url)
  return {
    [prop]: urls[0],
    [`${prop}Dark`]: urls.length === 2 ? urls[1] : null
  }
}

export const getDisplayWidth = ancestors => {
  const infobox = ancestors.find(matchInfoBox)
  if (infobox) {
    return INFOBOX_IMAGE_SIZES[
      infobox.data.figureSize || INFOBOX_DEFAULT_IMAGE_SIZE
    ]
  }
  const quote = ancestors.find(matchQuote)
  if (quote) {
    return PULLQUOTE_IMAGE_SIZE
  }
  const figure = ancestors.find(matchFigure)
  if (figure) {
    if (figure.data.size) {
      return FIGURE_SIZES[figure.data.size]
    }
    // child of root === e2e, root === ancestor[-1]
    if (ancestors.indexOf(figure) === ancestors.length - 2) {
      return 1200
    }
  }
  return FIGURE_SIZES.center
}

const nestedInlines = [
  {
    matchMdast: matchType('sub'),
    component: Sub,
    editorModule: 'mark',
    editorOptions: {
      type: 'sub'
    }
  },
  {
    matchMdast: matchType('sup'),
    component: Sup,
    editorModule: 'mark',
    editorOptions: {
      type: 'sup'
    }
  },
  {
    matchMdast: matchSpanType('MEMO'),
    editorModule: 'memo',
    editorOptions: {
      parentTypes: [
        'CREDIT',
        'PARAGRAPH',
        'NOTEP',
        'CAPTION_TEXT',
        'LOGBOOK_CREDIT',
        'INFOH', //?
        'INFOP',
        'QUOTEP',
        'QUOTECITE',
        'BLOCKQUOTEPARAGRAPH',
        'BYLINE'
      ]
    }
  }
]

export const globalInlines = [
  ...nestedInlines,
  {
    matchMdast: matchType('break'),
    component: () => <br />,
    isVoid: true
  }
]

export const skipMdastImage = {
  matchMdast: matchImagesParagraph,
  component: () => null,
  isVoid: true
}

export const styles = {
  link: css({
    color: 'inherit',
    textDecoration: 'none'
  }),
  anchor: css({
    display: 'block',
    visibility: 'hidden',
    position: 'relative',
    top: -65, // HEADER_HEIGHT_MOBILE + 20
    [mUp]: {
      top: -80 // HEADER_HEIGHT + 20
    }
  })
}

const slugDateFormat = timeFormat('%Y/%m/%d')

export const getDatePath = ({ publishDate, slug }) =>
  `/${slugDateFormat(publishDate)}/${(slug || '').split('/').pop()}`

export const mdastToString = node =>
  node
    ? node.value ||
      (node.children && node.children.map(mdastToString).join('')) ||
      ''
    : ''
