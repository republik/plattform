import React, { forwardRef } from 'react'
import { css } from 'glamor'
import { useColorContext } from '../Colors/ColorContext'
import { mUp } from '../../theme/mediaQueries'
import { fontStyles } from '../../theme/fonts'
import { ListItem as InnerListItem } from '../List'
import { useRenderContext } from '../Editor/Render/Context'
import { pxToRem } from '../Typography/utils'

export const Layout = ({ children, attributes }) => {
  const [colorScheme] = useColorContext()
  return (
    <div {...colorScheme.set('background', 'journalBg')} {...attributes}>
      {children}
    </div>
  )
}

export const H1 = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()

  return (
    <h1
      {...attributes}
      {...props}
      {...colorScheme.set('color', 'journalText')}
      {...css({
        ...fontStyles.flyerTitle,
        fontSize: pxToRem('27px'),
        lineHeight: 1.185,
        letterSpacing: pxToRem('0.5px'),
        margin: '0 0 28px',
        [mUp]: {
          fontSize: pxToRem('54px'),
          lineHeight: 1.2,
          margin: '0 0 36px',
        },
      })}
    >
      {children}
    </h1>
  )
}

export const H2 = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <h2
      {...attributes}
      {...props}
      {...colorScheme.set('color', 'journalFormatText')}
      {...css({
        ...fontStyles.flyerTitle,
        fontSize: pxToRem('14px'),
        lineHeight: 1,
        letterSpacing: 1.4,
        margin: '0 0 6px',
        textTransform: 'uppercase',
        [mUp]: {
          fontSize: pxToRem('20px'),
          lineHeight: 0.75,
          letterSpacing: 1,
          margin: '0 0 12px',
        },
      })}
    >
      {children}
    </h2>
  )
}

export const H3 = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <h3
      {...attributes}
      {...props}
      {...colorScheme.set('color', 'journalText')}
      {...css({
        ...fontStyles.flyerTitle,
        fontSize: pxToRem('26px'),
        lineHeight: 1.231,
        letterSpacing: pxToRem('0.5px'),
        margin: '0 0 12px',
        [mUp]: {
          fontSize: pxToRem('40px'),
          lineHeight: 1.2,
          margin: '0 0 18px',
        },
      })}
    >
      {children}
    </h3>
  )
}

export const P = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...attributes}
      {...props}
      {...css({
        ...fontStyles.sansSerifRegular,
        fontSize: pxToRem('17px'),
        lineHeight: 1.471,
        margin: '0 0 22px',
        [mUp]: {
          fontSize: pxToRem('23px'),
          lineHeight: 1.522,
          margin: '0 0 16px',
        },
      })}
      {...colorScheme.set('color', 'journalText')}
    >
      {children}
    </p>
  )
}

export const MetaP = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...attributes}
      {...props}
      {...css({
        ...fontStyles.sansSerifMedium,
        fontSize: pxToRem('20px'),
        lineHeight: 1.45,
        margin: '0 0 50px',
        [mUp]: {
          fontSize: pxToRem('28px'),
          lineHeight: 1.429,
          margin: '0 0 66px',
        },
      })}
      {...colorScheme.set('color', 'journalMetaText')}
    >
      {children}
    </p>
  )
}

export const Small = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()

  return (
    <p
      {...attributes}
      {...props}
      {...css({
        ...fontStyles.sansSerifRegular,
        fontSize: pxToRem('14px'),
        lineHeight: 1.214,
        margin: 0,
        [mUp]: {
          fontSize: pxToRem('17px'),
          lineHeight: 1.235,
        },
      })}
      {...colorScheme.set('color', 'journalText')}
    >
      {children}
    </p>
  )
}

export const Emphasis = ({ children, attributes, ...props }) => (
  <strong {...props} {...attributes} {...css(fontStyles.sansSerifMedium)}>
    {children}
  </strong>
)

export const Cursive = ({ children, attributes, ...props }) => (
  <em {...props} {...attributes} {...css(fontStyles.sansSerifItalic)}>
    {children}
  </em>
)

export const StrikeThrough = ({ children, attributes, ...props }) => (
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

export const ListItem: React.FC<{
  attributes: any
  children: React.ReactNode
}> = ({ children, attributes = {}, ...props }) => {
  const { ref, ...attrs } = attributes
  return (
    <InnerListItem attributes={attrs} {...props} flyer={true}>
      {children}
    </InnerListItem>
  )
}

const linkStyle = css({
  color: 'inherit',
  textDecoration: 'underline',
  textDecorationSkip: 'ink',
  cursor: 'pointer',
})

// TODO: forwardRef is problematic inside Slate
//  check if this is OK
//  otherwise use a link with forward ref on render
//  and one without in the editor
export const A = forwardRef<HTMLAnchorElement, any>(
  ({ children, attributes, ...props }, ref) => (
    <a {...attributes} {...props} {...linkStyle} ref={ref}>
      {children}
    </a>
  ),
)

// TODO: forwardRef is problematic inside Slate:
//  for now we use the noref compoment inside the editor
//  we should check what causes this and if it can be fixed
export const NoRefA = ({ children, attributes, ...props }) => (
  <a {...attributes} {...props} {...linkStyle}>
    {children}
  </a>
)

export const Link: React.FC<any> = ({ children, href, ...props }) => {
  const { Link } = useRenderContext()
  return (
    <Link href={href} passhref>
      <A href={href} {...props}>
        {children}
      </A>
    </Link>
  )
}
