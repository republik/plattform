import React, { forwardRef, ReactNode } from 'react'
import { css } from 'glamor'
import { useColorContext } from '../Colors/ColorContext'
import { mUp } from '../../theme/mediaQueries'
import { fontStyles } from '../../theme/fonts'
import { LIST_PADDING } from '../List/List'
import { useRenderContext } from '../Editor/Render/Context'
import { pxToRem } from './utils'
import colors from '../../theme/colors'

type BaseProps = {
  children?: ReactNode
  attributes?: any
  [x: string]: unknown
}
type Typography = React.FC<BaseProps>

export const Layout: Typography = ({ children, attributes }) => {
  const [colorScheme] = useColorContext()
  return (
    <div {...colorScheme.set('background', 'flyerBg')} {...attributes}>
      {children}
    </div>
  )
}

export const H1: Typography = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()

  return (
    <h1
      {...attributes}
      {...props}
      {...colorScheme.set('color', 'flyerText')}
      {...css({
        ...fontStyles.flyerTitle,
        lineHeight: 1.185,
        letterSpacing: '0.5px',
        fontSize: 27,
        margin: '0 0 28px',
        [mUp]: {
          fontSize: 54,
          lineHeight: 1.204,
          margin: '0 0 36px',
        },
      })}
    >
      {children}
    </h1>
  )
}

export const H2: Typography = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <h2
      {...attributes}
      {...props}
      {...colorScheme.set('color', 'flyerFormatText')}
      {...css({
        ...fontStyles.flyerTitle,
        textTransform: 'uppercase',
        fontSize: 14,
        letterSpacing: 1.4,
        lineHeight: 1.142,
        margin: '0 0 6px',
        [mUp]: {
          fontSize: 20,
          letterSpacing: 1,
          lineHeight: 1.1,
          margin: '0 0 12px',
        },
      })}
    >
      {children}
    </h2>
  )
}

export const H3: Typography = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <h3
      {...attributes}
      {...props}
      {...colorScheme.set('color', 'flyerText')}
      {...css({
        ...fontStyles.flyerTitle,
        lineHeight: 1.231,
        letterSpacing: '0.5px',
        fontSize: 26,
        margin: '0 0 12px',
        [mUp]: {
          fontSize: 40,
          lineHeight: 1.2,
          margin: '0 0 18px',
        },
      })}
    >
      {children}
    </h3>
  )
}

export const P: Typography = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...attributes}
      {...props}
      {...css({
        ...fontStyles.sansSerifRegular,
        '& em, & i': fontStyles.sansSerifItalic,
        '& strong, & b': fontStyles.sansSerifMedium,
        '& strong em, & em strong, & b i, & i b': {
          textDecoration: `underline wavy ${'var(--color-error)'}`,
        },
        fontSize: 17,
        lineHeight: 1.471,
        margin: '0 0 16px',
        [mUp]: {
          fontSize: 23,
          lineHeight: 1.522,
          margin: '0 0 22px',
        },
      })}
      {...colorScheme.set('color', 'flyerText')}
    >
      {children}
    </p>
  )
}

export const MetaP: Typography = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...attributes}
      {...props}
      {...css({
        ...fontStyles.sansSerifMedium,
        fontSize: 20,
        lineHeight: 1.45,
        margin: '0 0 50px',
        [mUp]: {
          fontSize: 28,
          lineHeight: 1.429,
          margin: '0 0 66px',
        },
      })}
      {...colorScheme.set('color', 'flyerMetaText')}
    >
      {children}
    </p>
  )
}

export const OpeningP: Typography = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...attributes}
      {...props}
      {...css({
        ...fontStyles.sansSerifBold,
        fontSize: 22,
        lineHeight: 1.318,
        margin: 0,
        [mUp]: {
          fontSize: 29,
          lineHeight: 1.397,
          margin: 0,
        },
      })}
      {...colorScheme.set('color', 'flyerText')}
    >
      {children}
    </p>
  )
}

export const Small: Typography = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()

  return (
    <p
      {...attributes}
      {...props}
      {...css({
        ...fontStyles.sansSerifRegular,
        fontSize: 14,
        lineHeight: 1.214,
        margin: 0,
        [mUp]: {
          fontSize: 17,
          lineHeight: 1.235,
        },
      })}
      {...colorScheme.set('color', 'flyerText')}
    >
      {children}
    </p>
  )
}

export const Emphasis: Typography = ({ children, attributes, ...props }) => (
  <strong {...props} {...attributes}>
    {children}
  </strong>
)

export const Cursive: Typography = ({ children, attributes, ...props }) => (
  <em {...props} {...attributes}>
    {children}
  </em>
)

export const StrikeThrough: Typography = ({
  children,
  attributes,
  ...props
}) => (
  <span
    {...attributes}
    {...props}
    {...css({
      textDecoration: 'line-through',
    })}
  >
    {children}
  </span>
)

const ulRule = css({
  marginBottom: 25,
  marginLeft: 0,
  paddingLeft: 0,
  listStyle: 'none',
  '& > li:before': {
    content: '—',
    position: 'absolute',
    left: 0,
  },
})

export const UL: Typography = ({ children, attributes, ...props }) => {
  return (
    <ul {...attributes} {...props} {...ulRule}>
      {children}
    </ul>
  )
}

const olRule = css({
  marginBottom: 25,
  paddingLeft: '1.7em',
  '& > li': {
    paddingLeft: 8,
  },
})

export const OL: Typography = ({ children, attributes, ...props }) => {
  return (
    <ol {...attributes} {...props} {...olRule}>
      {children}
    </ol>
  )
}

const listItemRule = css({
  ...fontStyles.sansSerifRegular,
  '& em, & i': fontStyles.sansSerifItalic,
  '& strong, & b': fontStyles.sansSerifBold,
  '& strong em, & em strong, & b i, & i b': {
    textDecoration: `underline wavy ${'var(--color-error)'}`,
  },
  paddingLeft: `${LIST_PADDING}px`,
  position: 'relative',
  fontSize: pxToRem('17px'),
  lineHeight: pxToRem('22px'),
  margin: '0 0 12px',
  [mUp]: {
    fontSize: pxToRem('23px'),
    lineHeight: pxToRem('28px'),
    margin: '0 0 14px',
  },
})
export const ListItem: React.FC<{
  attributes?: any
  children: React.ReactNode
  style?: React.CSSProperties
}> = ({ children, attributes, style = {} }) => {
  const [colorScheme] = useColorContext()
  return (
    <li
      {...listItemRule}
      {...colorScheme.set('color', 'text')}
      {...attributes}
      // this style override even with an empty object is necessary
      // - otherwise slates/editors position relativ will destroy ol li marker
      style={style}
    >
      {children}
    </li>
  )
}

const linkStyle = css({
  color: 'inherit',
  textDecoration: 'underline',
  textDecorationSkip: 'ink',
  cursor: 'pointer',
})

// TODO: forwardRef is problematic inside Slate:
//  for now we use the noref compoment inside the editor
//  we should check what causes this and if it can be fixed
export const NoRefA: Typography = ({ children, attributes, ...props }) => (
  <a {...attributes} {...props} {...linkStyle}>
    {children}
  </a>
)

// Outside the editor we use a A with forwardRef for Next.js Link compat
const A = forwardRef<HTMLAnchorElement, BaseProps>(
  ({ children, attributes, ...props }, ref) => (
    <a {...attributes} {...props} {...linkStyle} ref={ref}>
      {children}
    </a>
  ),
)

export const Link: React.FC<any> = ({ children, href, ...props }) => {
  const { Link } = useRenderContext()
  return (
    <Link href={href} passHref>
      <A href={href} {...props}>
        {children}
      </A>
    </Link>
  )
}
