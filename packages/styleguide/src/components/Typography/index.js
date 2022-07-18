import React, { useMemo } from 'react'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { fontStyles as _fontStyles } from '../../theme/fonts'
import * as _fontStyleSizes from './styles'
import * as _Editorial from './Editorial'
import * as _Interaction from './Interaction'
import * as _Meta from './Meta'
import * as _Scribble from './Scribble'
import { css } from 'glamor'
import { convertStyleToRem } from './utils'
import { useColorContext } from '../Colors/useColorContext'

// Namespaced exports.
export const Editorial = { ..._Editorial }
export const Interaction = { ..._Interaction }
export const Meta = { ..._Meta }
export const Scribble = { ..._Scribble }

// Direct exports.
export const fontStyles = {
  ..._fontStyles,
  ..._fontStyleSizes,
}

export const linkStyle = {
  textDecoration: 'none',
  color: colors.primary,
  '@media (hover)': {
    ':hover': {
      color: colors.secondary,
    },
  },
}

export const linkRule = css(linkStyle)

export const plainLinkRule = css({
  textDecoration: 'none',
  color: 'inherit',
})

const styles = {
  h1: css({
    ...fontStyles.serifBold36,
    [mUp]: {
      ...fontStyles.serifBold52,
    },
    margin: '30px 0 20px 0',
    ':first-child': {
      marginTop: 0,
    },
    ':last-child': {
      marginBottom: 0,
    },
  }),
  h2: css({
    ...fontStyles.serifBold19,
    [mUp]: {
      ...fontStyles.serifBold24,
    },
    margin: '30px 0 20px 0',
    ':first-child': {
      marginTop: 0,
    },
    ':last-child': {
      marginBottom: 0,
    },
  }),
  lead: css({
    ...fontStyles.serifRegular25,
    margin: '20px 0 20px 0',
  }),
  p: css({
    ...fontStyles.serifRegular16,
    [mUp]: {
      ...fontStyles.serifRegular21,
    },
    margin: '20px 0 20px 0',
    ':first-child': {
      marginTop: 0,
    },
    ':last-child': {
      marginBottom: 0,
    },
  }),
  hr: css({
    border: 0,
    height: 1,
    marginTop: 30,
    marginBottom: 30,
  }),
  label: css({
    ...convertStyleToRem(fontStyles.sansSerifRegular14),
  }),
}

export const A = React.forwardRef(({ children, ...props }, ref) => {
  const [colorScheme] = useColorContext()
  const linkStyleRule = useMemo(
    () =>
      css({
        textDecoration: 'none',
        color: colorScheme.getCSSColor('primary'),
        '@media (hover)': {
          ':hover': {
            color: colorScheme.getCSSColor('primaryHover'),
          },
        },
      }),
    [colorScheme],
  )
  return (
    <a {...props} {...linkStyleRule} ref={ref}>
      {children}
    </a>
  )
})

export const H1 = ({ children, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <h1 {...props} {...styles.h1} {...colorScheme.set('color', 'text')}>
      {children}
    </h1>
  )
}

export const H2 = ({ children, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <h2 {...props} {...styles.h2} {...colorScheme.set('color', 'text')}>
      {children}
    </h2>
  )
}

export const Lead = ({ children, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <p {...props} {...styles.lead} {...colorScheme.set('color', 'text')}>
      {children}
    </p>
  )
}

export const P = ({ children, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <p {...props} {...styles.p} {...colorScheme.set('color', 'text')}>
      {children}
    </p>
  )
}

export const Label = ({ children, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <span {...props} {...styles.label} {...colorScheme.set('color', 'text')}>
      {children}
    </span>
  )
}

const subSupStyles = {
  base: css({
    display: 'inline-block',
    textDecoration: 'none',
    fontSize: '75%',
    lineHeight: '1.4em',
    position: 'relative',
    verticalAlign: 'baseline',
  }),
  sub: css({
    bottom: '-0.25em',
  }),
  sup: css({
    top: '-0.5em',
  }),
}

export const Sub = ({ children, attributes }) => (
  <sub {...attributes} {...subSupStyles.base} {...subSupStyles.sub}>
    {children}
  </sub>
)

export const Sup = ({ children, attributes }) => (
  <sup {...attributes} {...subSupStyles.base} {...subSupStyles.sup}>
    {children}
  </sup>
)

export const HR = ({ attributes }) => {
  const [colorScheme] = useColorContext()
  return (
    <hr
      {...attributes}
      {...styles.hr}
      {...colorScheme.set('color', 'divider')}
      {...colorScheme.set('backgroundColor', 'divider')}
    />
  )
}
