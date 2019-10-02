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

const pxToEm = (cssRules, baseFontSize = 16) => {
    return {
        ...cssRules,
        fontSize: cssRules.fontSize && (parseInt(cssRules.fontSize) / baseFontSize + 'em'),
        lineHeight: cssRules.fontSize && cssRules.lineHeight &&
            (parseInt(cssRules.lineHeight) / parseInt(cssRules.fontSize))
    }
}

const headline = css({
  ...pxToEm(styles.serifTitle30),
  margin: '0 0 12px 0',
  [mUp]: {
    ...pxToEm(styles.serifTitle58),
    '[data-type*="meta"] > &': {
      ...pxToEm(styles.sansSerifMedium58)
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
  ...pxToEm(styles.serifBold19),
  margin: '36px 0 8px 0',
  [mUp]: {
    ...pxToEm(styles.serifBold24),
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
  ...pxToEm(styles.serifRegular19),
  display: 'inline',
  margin: '0 0 10px 0',
  [mUp]: {
    ...pxToEm(styles.serifRegular23),
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
  ...pxToEm(styles.sansSerifRegular19),
  [mUp]: {
    ...pxToEm(styles.sansSerifRegular23),
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
  ...pxToEm(styles.sansSerifRegular14),
  [mUp]: {
    ...pxToEm(styles.sansSerifRegular15),
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
  ...pxToEm(styles.sansSerifMedium16),
  margin: '0 0 18px 0',
  [mUp]: {
    ...pxToEm(styles.sansSerifMedium20),
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
  ...pxToEm(styles.serifRegular17),
  [mUp]: {
    ...pxToEm(styles.serifRegular19),
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
  ...pxToEm(styles.serifBold17),
  margin: '36px 0 -14px 0',
  [mUp]: {
    ...pxToEm(styles.serifBold19),
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
  ...pxToEm(styles.sansSerifRegular12),
  margin: '22px 0',
  [mUp]: {
    ...pxToEm(styles.sansSerifRegular15),
    margin: '30px 0'
  }
})

export const Note = ({ children, attributes, ...props }) => (
  <p {...attributes} {...props} {...note} {...interactionFontRule}>
    {children}
  </p>
)
