import { css } from 'glamor'
import React from 'react'

import { mUp } from '../../theme/mediaQueries'
import { useColorContext } from '../Colors/useColorContext'
import {
  sansSerifRegular12,
  sansSerifRegular15,
  sansSerifRegular16,
  sansSerifRegular17,
  sansSerifRegular19,
} from '../Typography/styles'
import { convertStyleToRem } from '../Typography/utils'

const styles = {
  p: css({
    ...convertStyleToRem(sansSerifRegular15),
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular16),
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
    ...convertStyleToRem(sansSerifRegular17),
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular19),
    },
  }),
}

const Paragraph = ({ children }) => <p {...styles.p}>{children}</p>

export const FeaturedText = ({ children }) => (
  <span {...styles.featuredText}>{children}</span>
)

export const Heading = ({ children }) => (
  <Paragraph>
    <strong>{children}</strong>
  </Paragraph>
)

export const Definition = ({ children }) => (
  <p {...styles.definition}>{children}</p>
)

export const Code = ({ children }) => {
  const [colorScheme] = useColorContext()
  return (
    <code {...styles.code} {...colorScheme.set('backgroundColor', 'hover')}>
      {children}
    </code>
  )
}

export default Paragraph
