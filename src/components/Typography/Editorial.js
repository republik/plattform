import React from 'react'
import * as styles from './styles'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'

const editorialHeadline = css({
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

const editorialSubhead = css({
  ...styles.serifBold19,
  margin: '36px 0 -14px 0',
  [mUp]: {
    ...styles.serifBold24,
    margin: '46px 0 -18px 0'
  },
  color: colors.text
})

const editorialQuestion = css({
  ...styles.serifBold16,
  margin: '36px 0 -14px 0',
  [mUp]: {
    ...styles.serifBold19,
    lineHeight: '30px',
    margin: '46px 0 -18px 0'
  },
  color: colors.text
})

const editorialLead = css({
  ...styles.serifRegular19,
  margin: '0 0 10px 0',
  [mUp]: {
    ...styles.serifRegular23,
    margin: '0 0 20px 0'
  },
  color: colors.text
})

const editorialCredit = css({
  margin: 0,
  ...styles.sansSerifRegular14,
  [mUp]: {
    ...styles.sansSerifRegular15
  },
  color: colors.text
})

const editorialP = css({
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

const editorialAuthorLink = css({
  textDecoration: 'underline',
  color: colors.text,
  ':hover': {
    color: colors.lightText
  }
})

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

const editorialFormat = css({
  ...typeRules,
  ...styles.sansSerifMedium16,
  margin: '0 0 18px 0',
  [mUp]: {
    ...styles.sansSerifMedium20,
    margin: '0 0 28px 0'
  },
  textDecoration: 'underline'
})

// attributes are piped through for publikator editor support.

export const Headline = ({ children, attributes, ...props }) => (
  <h1 {...attributes} {...props} {...editorialHeadline}>
    {children}
  </h1>
)

export const Subhead = ({ children, attributes, ...props }) => (
  <h2 {...attributes} {...props} {...editorialSubhead}>
    {children}
  </h2>
)

export const Lead = ({ children, attributes, ...props }) => (
  <p {...attributes} {...props} {...editorialLead}>
    {children}
  </p>
)

export const Credit = ({ children, attributes, ...props }) => (
  <p {...attributes} {...props} {...editorialCredit}>
    {children}
  </p>
)

export const P = ({ children, attributes, ...props }) => (
  <p {...attributes} {...props} {...editorialP}>
    {children}
  </p>
)

export const Answer = ({ children, attributes, ...props }) => (
  <p {...attributes} {...props} {...editorialP}>
    {children}
  </p>
)

export const AnswerBy = ({ children, attributes, ...props }) => (
  <b {...attributes} {...props}>
    {children}:
  </b>
)

export const Question = ({ children, attributes, ...props }) => (
  <p {...attributes} {...props} {...editorialQuestion}>
    {children}
  </p>
)

export const AuthorLink = ({ children, attributes, ...props }) => (
  <a {...attributes} {...props} {...editorialAuthorLink}>
    {children}
  </a>
)

export const Format = ({ children, attributes, ...props }) => (
  <p {...attributes} {...props} {...editorialFormat}>
    {children}
  </p>
)

//export default Editorial
