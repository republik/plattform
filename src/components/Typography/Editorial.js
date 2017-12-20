import React from 'react'
import * as styles from './styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { fontFamilies } from '../../theme/fonts'
import { underline } from '../../lib/styleMixins'
import colors, { colorForKind } from '../../theme/colors'

export { List, UnorderedList as UL, OrderedList as OL, ListItem as LI } from '../List'

const headline = css({
  ...styles.serifTitle30,
  margin: '0 0 12px 0',
  [mUp]: {
    ...styles.serifTitle58,
    '[data-type*="meta"] > &': {
      ...styles.sansSerifMedium58
    },
    margin: '0 0 12px 0'
  },
  color: colors.text,
  ':first-child': {
    marginTop: 0
  },
  ':last-child': {
    marginBottom: 0
  }
})

export const Headline = ({ children, attributes, ...props }) => (
  <h1 {...attributes} {...props} {...headline}>
    {children}
  </h1>
)

const subhead = css({
  ...styles.serifBold19,
  margin: '36px 0 -14px 0',
  [mUp]: {
    ...styles.serifBold24,
    margin: '46px 0 -18px 0'
  },
  color: colors.text
})

export const Subhead = ({ children, attributes, ...props }) => (
  <h2 {...attributes} {...props} {...subhead}>
    {children}
  </h2>
)

const lead = css({
  ...styles.serifRegular19,
  margin: '0 0 10px 0',
  [mUp]: {
    ...styles.serifRegular23,
    margin: '0 0 20px 0'
  },
  color: colors.text
})

export const Lead = ({ children, attributes, ...props }) => (
  <p {...attributes} {...props} {...lead}>
    {children}
  </p>
)

const credit = css({
  margin: 0,
  ...styles.sansSerifRegular14,
  [mUp]: {
    ...styles.sansSerifRegular15
  },
  color: colors.text
})

export const Credit = ({ children, attributes, ...props }) => (
  <p {...attributes} {...props} {...credit}>
    {children}
  </p>
)

const format = css({
  ...styles.sansSerifMedium16,
  margin: '0 0 18px 0',
  [mUp]: {
    ...styles.sansSerifMedium20,
    margin: '0 0 28px 0'
  },
  ...underline
})

export const Format = ({ children, kind, attributes, ...props }) => (
  <p {...attributes} {...props} {...format} style={{color: colorForKind(kind)}}>
    {children}
  </p>
)

const paragraph = css({
  color: colors.text,
  margin: '22px 0 22px 0',
  ...styles.serifRegular16,
  [mUp]: {
    ...styles.serifRegular19,
    margin: '30px 0 30px 0',
    lineHeight: '30px'
  },
  ':first-child': {
    marginTop: 0
  },
  ':last-child': {
    marginBottom: 0
  }
})
export const P = ({ children, attributes, ...props }) => (
  <p {...attributes} {...props} {...paragraph}>
    {children}
  </p>
)

const question = css({
  ...styles.serifBold16,
  margin: '36px 0 -14px 0',
  [mUp]: {
    ...styles.serifBold19,
    lineHeight: '30px',
    margin: '46px 0 -18px 0'
  },
  color: colors.text
})
export const Question = ({ children, attributes, ...props }) => (
  <p {...attributes} {...props} {...question}>
    {children}
  </p>
)

export const Answer = P

const emphasis = css({
  fontWeight: 'normal',
  fontFamily: fontFamilies.serifBold
})
export const Emphasis = ({ children, attributes, ...props }) => (
  <strong {...attributes} {...props} {...emphasis}>
    {children}
  </strong>
)

export const link = css({
  ...underline,
  color: colors.text,
  ':hover': {
    color: colors.lightText
  }
})
export const A = ({ children, attributes, ...props }) => (
  <a {...attributes} {...props} {...link}>
    {children}
  </a>
)
