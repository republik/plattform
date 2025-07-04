import { css } from 'glamor'
import React, { useMemo } from 'react'
import colors from '../../theme/colors'
import { fontStyles as _fontStyles } from '../../theme/fonts'
import { mUp } from '../../theme/mediaQueries'
import { useColorContext } from '../Colors/useColorContext'
import * as _Editorial from './Editorial'
import * as _Interaction from './Interaction'
import * as _Meta from './Meta'
import * as _Scribble from './Scribble'
import * as _fontStyleSizes from './styles'
import { convertStyleToRem } from './utils'

// Namespaced exports.
export const Editorial = { ..._Editorial }
export const Interaction = { ..._Interaction }
export const Meta = { ..._Meta }
export const Scribble = { ..._Scribble }
export const Flyer = { ..._Flyer }

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

type LinkProps = {
  children: React.ReactNode
} & React.ComponentPropsWithoutRef<'a'>

export const A = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ children, ...props }, ref) => {
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
  },
)

type HeadingProps = {
  children: React.ReactNode
} & React.ComponentPropsWithoutRef<'h1'>

export const H1 = ({ children, ...props }: HeadingProps) => {
  const [colorScheme] = useColorContext()
  return (
    <h1 {...props} {...styles.h1} {...colorScheme.set('color', 'text')}>
      {children}
    </h1>
  )
}

export const H2 = ({ children, ...props }: HeadingProps) => {
  const [colorScheme] = useColorContext()
  return (
    <h2 {...props} {...styles.h2} {...colorScheme.set('color', 'text')}>
      {children}
    </h2>
  )
}

type LeadProps = {
  children: React.ReactNode
} & React.ComponentPropsWithoutRef<'p'>

export const Lead = ({ children, ...props }: LeadProps) => {
  const [colorScheme] = useColorContext()
  return (
    <p {...props} {...styles.lead} {...colorScheme.set('color', 'text')}>
      {children}
    </p>
  )
}

type ParagraphProps = {
  children: React.ReactNode
} & React.ComponentPropsWithoutRef<'p'>

export const P = ({ children, ...props }: ParagraphProps) => {
  const [colorScheme] = useColorContext()
  return (
    <p {...props} {...styles.p} {...colorScheme.set('color', 'text')}>
      {children}
    </p>
  )
}

type LabelProps = {
  children: React.ReactNode
} & React.ComponentPropsWithoutRef<'span'>

export const Label = ({ children, ...props }: LabelProps) => {
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

type SubProps = {
  children: React.ReactNode
  attributes: React.ComponentPropsWithoutRef<'sub'>
}

export const Sub = ({ children, attributes }: SubProps) => (
  <sub {...attributes} {...subSupStyles.base} {...subSupStyles.sub}>
    {children}
  </sub>
)

type SupProps = {
  children: React.ReactNode
  attributes: React.ComponentPropsWithoutRef<'sup'>
}

export const Sup = ({ children, attributes }: SupProps) => (
  <sup {...attributes} {...subSupStyles.base} {...subSupStyles.sup}>
    {children}
  </sup>
)

type HRProps = {
  attributes: React.ComponentPropsWithoutRef<'hr'>
}

export const HR = ({ attributes }: HRProps) => {
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
