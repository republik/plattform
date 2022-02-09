import React from 'react'
import * as styles from './styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { fontStyles } from '../../theme/fonts'
import { convertStyleToRem } from './utils'
import { useColorContext } from '../Colors/useColorContext'
import { interactionFontRule as fontRule } from './fontRules'

export { interactionFontRule as fontRule } from './fontRules'

const interactionHeadline = css({
  margin: '0 0 12px 0',
  ...convertStyleToRem(styles.sansSerifMedium30),
  [mUp]: {
    ...convertStyleToRem(styles.sansSerifMedium58),
  },
  ':first-child': {
    marginTop: 0,
  },
  ':last-child': {
    marginBottom: 0,
  },
})

const interactionH1 = css({
  ...convertStyleToRem(styles.sansSerifMedium30),
  [mUp]: {
    ...convertStyleToRem(styles.sansSerifMedium40),
  },
  margin: 0,
})

const interactionH2 = css({
  ...convertStyleToRem(styles.sansSerifMedium22),
  [mUp]: {
    ...convertStyleToRem(styles.sansSerifMedium30),
  },
  margin: 0,
})

const interactionH3 = css({
  ...convertStyleToRem(styles.sansSerifMedium19),
  [mUp]: {
    ...convertStyleToRem(styles.sansSerifMedium22),
  },
  margin: 0,
})

export const Headline = ({ children, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <h1
      {...props}
      {...interactionHeadline}
      {...colorScheme.set('color', 'text')}
    >
      {children}
    </h1>
  )
}

export const H1 = ({ children, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <h1 {...props} {...interactionH1} {...colorScheme.set('color', 'text')}>
      {children}
    </h1>
  )
}

export const H2 = ({ children, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <h2 {...props} {...interactionH2} {...colorScheme.set('color', 'text')}>
      {children}
    </h2>
  )
}

export const H3 = ({ children, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <h3 {...props} {...interactionH3} {...colorScheme.set('color', 'text')}>
      {children}
    </h3>
  )
}

const interactionP = css({
  margin: 0,
  ...convertStyleToRem(styles.sansSerifRegular17),
  [mUp]: {
    ...convertStyleToRem(styles.sansSerifRegular21),
  },
})

export const P = ({ children, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...props}
      {...interactionP}
      {...fontRule}
      {...colorScheme.set('color', 'text')}
    >
      {children}
    </p>
  )
}

const emphasis = css(fontStyles.sansSerifMedium)
export const Emphasis = ({ children, attributes, ...props }) => (
  <strong {...props} {...attributes} {...emphasis}>
    {children}
  </strong>
)

const cursive = css(fontStyles.sansSerifItalic)
export const Cursive = ({ children, attributes, ...props }) => (
  <em {...props} {...attributes} {...cursive}>
    {children}
  </em>
)
