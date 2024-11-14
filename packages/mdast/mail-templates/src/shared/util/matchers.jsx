import { timeFormat } from 'd3-time-format'

import Sub from '../components/Sub'
import Sup from '../components/Sup'

import {
  matchType,
  matchZone,
  matchImage,
  matchParagraph,
  matchImageParagraph,
} from '@republik/mdast-react-render'

import variableRule from '../rules/variableRule'

export const matchSpan = matchType('span')
export const matchSpanType = (type) => (node) =>
  matchSpan(node) && node.data?.type === type

export const matchInfoBox = matchZone('INFOBOX')
export const matchQuote = matchZone('QUOTE')
export const matchFigure = matchZone('FIGURE')

export const matchLast = (node, index, parent) =>
  index === parent.children.length - 1
export const matchTeaser = matchZone('TEASER')
export const matchTeaserGroup = matchZone('TEASERGROUP')
export const matchTeaserType = (teaserType) => (node) =>
  matchTeaser(node) && node.data.teaserType === teaserType

export const matchImagesParagraph = (node) =>
  matchImageParagraph(node) ||
  (matchParagraph(node) &&
    node.children.length === 3 &&
    matchImage(node.children[0]) &&
    matchImage(node.children[2]))

export const extractImage = (node) =>
  matchImageParagraph(node) ? node.children[0].url : undefined

export const extractImages = (node, prop = 'src') => {
  if (!matchImagesParagraph(node)) return undefined
  const urls = node.children.filter(matchImage).map((child) => child.url)
  return {
    [prop]: urls[0],
    [`${prop}Dark`]: urls.length === 2 ? urls[1] : null,
  }
}

const nestedInlines = [
  {
    matchMdast: matchType('sub'),
    component: Sub,
    editorModule: 'mark',
    editorOptions: {
      type: 'sub',
    },
  },
  {
    matchMdast: matchType('sup'),
    component: Sup,
    editorModule: 'mark',
    editorOptions: {
      type: 'sup',
    },
  },
  {
    matchMdast: matchSpanType('MEMO'),
    component: ({ children }) => <>{children}</>,
    editorModule: 'memo',
    editorOptions: {
      type: 'MEMO',
    },
  },
  variableRule,
]

export const globalInlines = [
  ...nestedInlines,
  {
    matchMdast: matchType('break'),
    component: () => <br />,
    isVoid: true,
  },
]

export const skipMdastImage = {
  matchMdast: matchImagesParagraph,
  component: () => null,
  isVoid: true,
}

const slugDateFormat = timeFormat('%Y/%m/%d')

export const getDatePath = ({ publishDate, slug }) =>
  `/${slugDateFormat(publishDate)}/${(slug || '').split('/').pop()}`

export const mdastToString = (node) =>
  node
    ? node.value ||
    (node.children && node.children.map(mdastToString).join('')) ||
    ''
    : ''
