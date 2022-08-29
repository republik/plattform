import React from 'react'
import { css } from 'glamor'
import { useColorContext } from '../Colors/ColorContext'
import { mUp } from '../../theme/mediaQueries'
import { fontStyles } from '../../theme/fonts'
import { link } from './Editorial'

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

export const H2 = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <h2
      {...attributes}
      {...props}
      {...colorScheme.set('color', 'journalFormatText')}
      {...css({
        ...fontStyles.flyerTitle,
        textTransform: 'uppercase',
        fontSize: 14,
        letterSpacing: 1.4,
        lineHeight: 1,
        margin: '0 0 6px',
        [mUp]: {
          fontSize: 20,
          letterSpacing: 1,
          lineHeight: 0.75,
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

export const P = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...attributes}
      {...props}
      {...css({
        ...fontStyles.sansSerifRegular,
        fontSize: 17,
        lineHeight: 1.471,
        margin: '0 0 22px',
        [mUp]: {
          fontSize: 23,
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
        fontSize: 20,
        lineHeight: 1.45,
        margin: '0 0 50px',
        [mUp]: {
          fontSize: 28,
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
        fontSize: 14,
        lineHeight: 1.214,
        margin: 0,
        [mUp]: {
          fontSize: 17,
          lineHeight: 1.235,
        },
      })}
      {...colorScheme.set('color', 'journalText')}
    >
      {children}
    </p>
  )
}

// TODO: forwardRef is problematic inside Slate
//  check if this is OK
//  otherwise use a link with forward ref on render
//  and one without in the editor
export const A = ({ children, attributes, ...props }) => (
  <a {...attributes} {...props} {...link}>
    {children}
  </a>
)
