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

const Paragraph = ({ attributes, children }) => (
  <p {...attributes} {...styles.p}>
    {children}
  </p>
)

export const FeaturedText = ({ attributes, children }) => (
  <span {...attributes} {...styles.featuredText}>
    {children}
  </span>
)

export const Heading = ({ attributes, children }) => (
  <Paragraph attributes={attributes}>
    <strong>{children}</strong>
  </Paragraph>
)

export const Definition = ({ attributes, children }) => (
  <p {...attributes} {...styles.definition}>
    {children}
  </p>
)

export const Code = ({ attributes, children }) => {
  const [colorScheme] = useColorContext()
  return (
    <code
      {...attributes}
      {...styles.code}
      {...colorScheme.set('backgroundColor', 'hover')}
    >
      {children}
    </code>
  )
}

export default Paragraph
