import React from 'react'
import * as styles from './styles'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { fontFamilies } from '../../theme/fonts'

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

export const Headline = ({ children, attributes }) => (
  <h1 {...attributes} {...headline}>
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

export const Subhead = ({ children, attributes }) => (
  <h2 {...attributes} {...subhead}>
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

export const Lead = ({ children, attributes }) => (
  <p {...attributes} {...lead}>
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

export const Credit = ({ children, attributes }) => (
  <p {...attributes} {...credit}>
    {children}
  </p>
)

const typeRules = {
  '[data-type="editorial"] > &': {
    color: colors.editorial
  },
  '[data-type="meta"] > &': {
    color: colors.meta
  },
  '[data-type="social"] > &': {
    color: colors.social
  }
}

const format = css({
  ...typeRules,
  ...styles.sansSerifMedium16,
  margin: '0 0 18px 0',
  [mUp]: {
    ...styles.sansSerifMedium20,
    margin: '0 0 28px 0'
  },
  textDecoration: 'underline'
})

export const Format = ({ children, attributes }) => (
  <p {...attributes} {...format}>
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
export const P = ({ children, attributes }) => (
  <p {...attributes} {...paragraph}>
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
export const Question = ({ children, attributes }) => (
  <p {...attributes} {...question}>
    {children}
  </p>
)

export const Answer = P

const emphasis = css({
  fontWeight: 'normal',
  fontFamily: fontFamilies.serifBold
})
export const Emphasis = ({ children, attributes }) => (
  <strong {...attributes} {...emphasis}>
    {children}
  </strong>
)

const link = css({
  textDecoration: 'underline',
  color: colors.text,
  ':hover': {
    color: colors.lightText
  }
})
export const A = ({ children, ...props, attributes }) => (
  <a {...attributes} {...props} {...link}>
    {children}
  </a>
)
