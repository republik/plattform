import React from 'react'
import { css } from 'glamor'

import { mUp } from '../../../theme/mediaQueries'
import {
  sansSerifRegular12,
  sansSerifRegular15,
  serifRegular14,
  serifRegular16,
  serifRegular17,
  serifRegular19,
} from '../../Typography/styles'
import { convertStyleToRem } from '../../Typography/utils'
import { useColorContext } from '../../Colors/useColorContext'
import {
  CodeProps,
  DefinitionProps,
  FeaturedTextProps,
  HeadingProps,
  ParagraphProps,
} from '../interfaces'

const styles = {
  p: css({
    ...convertStyleToRem(serifRegular14),
    [mUp]: {
      ...convertStyleToRem(serifRegular16),
    },
    margin: '10px 0',
    ':first-child': {
      marginTop: 0,
    },
    ':last-child': {
      marginBottom: 0,
    },
  }),
  code: css({
    borderRadius: '2px',
    display: 'inline-block',
    fontSize: '90%',
    padding: '0 5px',
  }),
  definition: css({
    ...convertStyleToRem(sansSerifRegular12),
    margin: '10px 0',
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular15),
    },
    '& ~ &': {
      marginTop: -5,
    },
  }),
  featuredText: css({
    ...convertStyleToRem(serifRegular17),
    [mUp]: {
      ...convertStyleToRem(serifRegular19),
    },
  }),
}

const Paragraph = ({ children }: ParagraphProps) => (
  <p {...styles.p}>{children}</p>
)

export const FeaturedText = ({ children }: FeaturedTextProps) => (
  <span {...styles.featuredText}>{children}</span>
)

export const Heading = ({ children }: HeadingProps) => (
  <Paragraph>
    <strong>{children}</strong>
  </Paragraph>
)

export const Definition = ({ children }: DefinitionProps) => (
  <p {...styles.definition}>{children}</p>
)

export const Code = ({ children }: CodeProps) => {
  const [colorScheme] = useColorContext()
  return (
    <code {...styles.code} {...colorScheme.set('backgroundColor', 'hover')}>
      {children}
    </code>
  )
}

export default Paragraph
