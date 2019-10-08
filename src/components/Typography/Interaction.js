import React from 'react'
import * as styles from './styles'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { fontStyles } from '../../theme/fonts'
import { convertStyleToRem } from './utils'

export const fontRule = css({
  ...fontStyles.sansSerifRegular,
  '& em, & i': fontStyles.sansSerifItalic,
  '& strong, & b': fontStyles.sansSerifMedium,
  '& strong em, & em strong, & b i, & i b': {
    textDecoration: `underline wavy ${colors.error}`
  }
})

const interactionHeadline = css({
  margin: '0 0 12px 0',
  ...convertStyleToRem(styles.sansSerifMedium30),
  [mUp]: {
    ...convertStyleToRem(styles.sansSerifMedium58)
  },
  color: colors.text,
  ':first-child': {
    marginTop: 0
  },
  ':last-child': {
    marginBottom: 0
  }
})

const interactionH1 = css({
  ...convertStyleToRem(styles.sansSerifMedium30),
  [mUp]: {
    ...convertStyleToRem(styles.sansSerifMedium40)
  },
  color: colors.text,
  margin: 0
})

const interactionH2 = css({
  ...convertStyleToRem(styles.sansSerifMedium22),
  [mUp]: {
    ...convertStyleToRem(styles.sansSerifMedium30)
  },
  color: colors.text,
  margin: 0
})

const interactionH3 = css({
  ...convertStyleToRem(styles.sansSerifMedium19),
  [mUp]: {
    ...convertStyleToRem(styles.sansSerifMedium22)
  },
  color: colors.text,
  margin: 0
})

const interactionP = css({
  color: colors.text,
  ...convertStyleToRem(styles.sansSerifRegular16),
  [mUp]: {
    ...convertStyleToRem(styles.sansSerifRegular21)
  },
  margin: 0
})


export const Headline = ({children, ...props}) => (
  <h1 {...props} {...interactionHeadline}>{children}</h1>
)

export const H1 = ({children, ...props}) => (
  <h1 {...props} {...interactionH1}>{children}</h1>
)

export const H2 = ({children, ...props}) => (
  <h2 {...props} {...interactionH2}>{children}</h2>
)

export const H3 = ({children, ...props}) => (
  <h3 {...props} {...interactionH3}>{children}</h3>
)

export const P = ({children, ...props}) => (
  <p {...props} {...interactionP} {...fontRule}>{children}</p>
)

const emphasis = css(fontStyles.sansSerifMedium)
export const Emphasis = ({children, attributes, ...props}) => (
  <strong {...props} {...attributes} {...emphasis}>{children}</strong>
)

const cursive = css(fontStyles.sansSerifItalic)
export const Cursive = ({children, attributes, ...props}) => (
  <em {...props} {...attributes} {...cursive}>{children}</em>
)
