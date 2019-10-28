import React from 'react'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { fontStyles as _fontStyles } from '../../theme/fonts'
import * as _fontStyleSizes from './styles'
import * as _Editorial from './Editorial'
import * as _Interaction from './Interaction'
import * as _Scribble from './Scribble'
import { css } from 'glamor'
import { convertStyleToRem } from './utils'
import { underline } from '../../lib/styleMixins'

// Namespaced exports.
export const Editorial = {..._Editorial}
export const Interaction = {..._Interaction}
export const Scribble = {..._Scribble}

// Direct exports.
export const fontStyles = {
  ..._fontStyles,
  ..._fontStyleSizes
}

export const linkStyle = {
  textDecoration: 'none',
  color: colors.primary,
  ':visited': {
    color: colors.primary
  },
  '@media (hover)': {
    ':hover': {
      color: colors.secondary
    }
  }
}
export const linkRule = css(linkStyle)

export const linkBlackStyle = css({
  ...underline,
  color: '#000000',
  '@media (hover)': {
    ':hover': {
      color: colors.text
    }
  }
})

export const linkErrorStyle = css({
  ...underline,
  color: colors.error,
  '@media (hover)': {
    ':hover': {
      color: colors.error
    }
  }
})

const styles = {
  h1: css({
    ...fontStyles.serifBold36,
    [mUp]: {
      ...fontStyles.serifBold52,
    },
    color: colors.text,
    margin: '30px 0 20px 0',
    ':first-child': {
      marginTop: 0
    },
    ':last-child': {
      marginBottom: 0
    }
  }),
  h2: css({
    ...fontStyles.serifBold19,
    [mUp]: {
      ...fontStyles.serifBold24
    },
    color: colors.text,
    margin: '30px 0 20px 0',
    ':first-child': {
      marginTop: 0
    },
    ':last-child': {
      marginBottom: 0
    }
  }),
  lead: css({
    ...fontStyles.serifRegular25,
    color: colors.text,
    margin: '20px 0 20px 0'
  }),
  p: css({
    color: colors.text,
    ...fontStyles.serifRegular16,
    [mUp]: {
      ...fontStyles.serifRegular21,
    },
    margin: '20px 0 20px 0',
    ':first-child': {
      marginTop: 0
    },
    ':last-child': {
      marginBottom: 0
    }
  }),
  hr: css({
    border: 0,
    height: 1,
    color: colors.divider,
    backgroundColor: colors.divider,
    marginTop: 30,
    marginBottom: 30
  }),
  label: css({
    ...convertStyleToRem(fontStyles.sansSerifRegular14),
    color: colors.secondary
  }),
  quote: css({
    ...fontStyles.sansSerifRegular21,
    color: colors.text,
  })
}

export const A = ({children, ...props}) => (
  <a {...props} {...linkRule}>{children}</a>
)

export const H1 = ({children, ...props}) => (
  <h1 {...props} {...styles.h1}>{children}</h1>
)

export const H2 = ({children, ...props}) => (
  <h2 {...props} {...styles.h2}>{children}</h2>
)

export const Lead = ({children, ...props}) => (
  <p {...props} {...styles.lead}>{children}</p>
)

export const P = ({children, ...props}) => (
  <p {...props} {...styles.p}>{children}</p>
)

export const Label = ({children, ...props}) => (
  <span {...props} {...styles.label}>{children}</span>
)

const subSupStyles = {
  base: css({
    display: 'inline-block',
    textDecoration: 'none',
    fontSize: '75%',
    lineHeight: '1.4em',
    position: 'relative',
    verticalAlign: 'baseline'
  }),
  sub: css({
    bottom: '-0.25em'
  }),
  sup: css({
    top: '-0.5em'
  })
}

export const Sub = ({children, attributes}) =>
  <sub {...attributes} {...subSupStyles.base} {...subSupStyles.sub}>{children}</sub>

export const Sup = ({children, attributes}) =>
  <sup {...attributes} {...subSupStyles.base} {...subSupStyles.sup}>{children}</sup>

export const HR = ({attributes}) =>
  <hr {...attributes} {...styles.hr} />

export const Quote = ({children, source, ...props}) => (
  <blockquote {...props} {...styles.quote}>
    <div>«{children}»</div>
    {!!source && <cite>{source}</cite>}
  </blockquote>
)
