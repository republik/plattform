import React from 'react'
import * as styles from './styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { fontStyles } from '../../theme/fonts'
import { underline } from '../../lib/styleMixins'
import colors from '../../theme/colors'
import { fontRule as interactionFontRule } from './Interaction'

export { List, UnorderedList as UL, OrderedList as OL, ListItem as LI } from '../List'

export const fontRule = css({
  ...fontStyles.serifRegular,
  '& em, & i': fontStyles.serifItalic,
  '& strong, & b': fontStyles.serifBold,
  '& strong em, & em strong, & b i, & i b': fontStyles.serifBoldItalic
})

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
  margin: '36px 0 8px 0',
  [mUp]: {
    ...styles.serifBold24,
    margin: '46px 0 12px 0'
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
  display: 'inline',
  margin: '0 0 10px 0',
  [mUp]: {
    ...styles.serifRegular23,
    margin: '0 0 20px 0'
  },
  color: colors.text
})

export const Lead = ({ children, attributes, ...props }) => (
  <p {...attributes} {...props} {...lead} {...fontRule}>
    {children}
  </p>
)

const subjectStyle = {
  color: '#8c8c8c',
  display: 'inline',
  margin: 0,
  ...styles.sansSerifRegular19,
  [mUp]: {
    ...styles.sansSerifRegular23,
    lineHeight: '27px'
  }
}

const subject = css({
  ...subjectStyle
})

const subjectWithChildren = css({
  ...subjectStyle,
  paddingRight: '.2em',
  '&::after': {
    content: " "
  }
})

export const Subject = ({ children, attributes, ...props }) => {
  const style = children && children.length > 0 ? subjectWithChildren : subject
  return (
    <h2 {...attributes} {...props} {...style}>
      {children}
    </h2>
  )
}

const credit = css({
  margin: '10px 0 0 0',
  ...styles.sansSerifRegular14,
  [mUp]: {
    ...styles.sansSerifRegular15,
    margin: '20px 0 0 0'
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
  }
})

export const Format = ({ children, color, attributes, ...props }) => (
  <p {...attributes} {...props} {...format} style={{color}}>
    {children}
  </p>
)

const paragraph = css({
  color: colors.text,
  margin: '22px 0 22px 0',
  ...styles.serifRegular17,
  [mUp]: {
    ...styles.serifRegular19,
    margin: '30px 0 30px 0'
  },
  ':first-child': {
    marginTop: 0
  },
  ':last-child': {
    marginBottom: 0
  },
  'h2 + &': {
    marginTop: 0
  }
})
export const P = ({ children, attributes, ...props }) => (
  <p {...attributes} {...props} {...paragraph} {...fontRule}>
    {children}
  </p>
)

const question = css({
  ...styles.serifBold17,
  margin: '36px 0 -14px 0',
  [mUp]: {
    ...styles.serifBold19,
    lineHeight: '30px',
    margin: '46px 0 -18px 0'
  },
  color: colors.text
})
export const Question = ({ children, attributes, ...props }) => (
  <p {...attributes} {...props} {...question} {...fontRule}>
    {children}
  </p>
)

export const Answer = P

const emphasis = css(fontStyles.serifBold)
export const Emphasis = ({ children, attributes, ...props }) => (
  <strong {...attributes} {...props} {...emphasis}>
    {children}
  </strong>
)

const cursive = css(fontStyles.serifItalic)
export const Cursive = ({ children, attributes, ...props }) => (
  <em {...attributes} {...props} {...cursive}>
    {children}
  </em>
)

const strikeThrough = css({
  textDecoration: 'line-through'
})
export const StrikeThrough = ({ children, attributes, ...props }) => (
  <span {...attributes} {...props} {...strikeThrough}>
    {children}
  </span>
)

export const link = css({
  ...underline,
  cursor: 'pointer',
  color: colors.text,
  '@media (hover)': {
    ':hover': {
      color: colors.lightText
    }
  }
})
export const A = ({ children, attributes, ...props }) => (
  <a {...attributes} {...props} {...link}>
    {children}
  </a>
)

const note = css({
  ...styles.sansSerifRegular12,
  margin: '22px 0',
  [mUp]: {
    ...styles.sansSerifRegular15,
    margin: '30px 0'
  }
})

export const Note = ({ children, attributes, ...props }) => (
  <p {...attributes} {...props} {...note} {...interactionFontRule}>
    {children}
  </p>
)
