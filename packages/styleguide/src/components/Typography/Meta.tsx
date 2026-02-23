import { css } from 'glamor'
import React from 'react'
import colors from '../../theme/colors'
import { fontStyles } from '../../theme/fonts'
import { mUp } from '../../theme/mediaQueries'
import { useColorContext } from '../Colors/useColorContext'
import * as styles from './styles'
import { convertStyleToRem, pxToRem } from './utils'

export const fontRule = css({
  ...fontStyles.sansSerifRegular,
  '& em, & i': fontStyles.sansSerifItalic,
  '& strong, & b': fontStyles.sansSerifMedium,
  '& strong em, & em strong, & b i, & i b': {
    textDecoration: `underline wavy ${colors.error}`,
  },
  '& a': {
    textDecoration: 'underline',
    color: 'inherit',
  },
})

const metaHeadline = css({
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

type HeadlineProps = {
  children: React.ReactNode
} & React.ComponentPropsWithoutRef<'h1'>

export const Headline = ({ children, ...props }: HeadlineProps) => {
  const [colorScheme] = useColorContext()
  return (
    <h1 {...props} {...metaHeadline} {...colorScheme.set('color', 'text')}>
      {children}
    </h1>
  )
}

const subhead = css({
  ...convertStyleToRem(styles.sansSerifMedium19),
  margin: '36px 0 8px 0',
  [mUp]: {
    ...convertStyleToRem(styles.sansSerifMedium24),
    margin: '46px 0 12px 0',
  },
  ':first-child': {
    marginTop: 0,
  },
  ':last-child': {
    marginBottom: 0,
  },
})

type SubheadProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'h2'>
} & React.ComponentPropsWithoutRef<'h2'>

export const Subhead = ({ children, attributes, ...props }: SubheadProps) => {
  const [colorScheme] = useColorContext()
  return (
    <h2
      {...attributes}
      {...props}
      {...subhead}
      {...colorScheme.set('color', 'text')}
    >
      {children}
    </h2>
  )
}

const metaP = css({
  margin: '22px 0 22px 0',
  ...convertStyleToRem(styles.sansSerifRegular17),
  [mUp]: {
    ...convertStyleToRem(styles.sansSerifRegular19),
    margin: `${pxToRem(30)} 0 ${pxToRem(30)} 0`,
  },
  ':first-child': {
    marginTop: 0,
  },
  ':last-child': {
    marginBottom: 0,
  },
  'h2 + &': {
    marginTop: 0,
  },
})

type ParagraphProps = {
  children: React.ReactNode
  isEmpty?: boolean
} & React.ComponentPropsWithoutRef<'p'>

export const P = ({ isEmpty, children, ...props }: ParagraphProps) => {
  const [colorScheme] = useColorContext()

  if (isEmpty) return null
  
  return (
    <p
      {...props}
      {...metaP}
      {...fontRule}
      {...colorScheme.set('color', 'text')}
    >
      {children}
    </p>
  )
}

const lead = css({
  ...convertStyleToRem(styles.sansSerifRegular19),
  display: 'inline',
  margin: '0 0 10px 0',
  [mUp]: {
    ...convertStyleToRem(styles.sansSerifRegular23),
    margin: '0 0 20px 0',
  },
})

type LeadProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'p'>
} & React.ComponentPropsWithoutRef<'p'>

export const Lead = ({ children, attributes, ...props }: LeadProps) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...attributes}
      {...props}
      {...lead}
      {...colorScheme.set('color', 'text')}
      {...fontRule}
    >
      {children}
    </p>
  )
}
