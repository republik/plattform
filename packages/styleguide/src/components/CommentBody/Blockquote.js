import { css } from 'glamor'
import React from 'react'
import { mUp } from '../../theme/mediaQueries'

import { useColorContext } from '../Colors/useColorContext'
import { sansSerifRegular15, sansSerifRegular17 } from '../Typography/styles'
import { convertStyleToRem } from '../Typography/utils'

const styles = {
  blockquote: css({
    margin: '20px auto',
    padding: '15px',
    [mUp]: {
      padding: '25px',
    },
  }),
  nestedBlockQuote: css({
    borderLeftWidth: 2,
    borderLeftStyle: 'solid',
  }),
  paragraph: css({
    margin: '6px 0',
    ...convertStyleToRem(sansSerifRegular15),
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular17),
      margin: '10px 0',
    },
    '&:first-child': {
      marginTop: 0,
    },
    '&:last-child': {
      marginBottom: 0,
    },
  }),
}

export const BlockQuoteParagraph = ({ children }) => (
  <p {...styles.paragraph}>{children}</p>
)

export const BlockQuoteNested = ({ children }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...styles.blockquote}
      {...styles.nestedBlockQuote}
      {...colorScheme.set('backgroundColor', 'hover')}
      {...colorScheme.set('borderColor', 'divider')}
    >
      {children}
    </div>
  )
}

export default ({ children }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...styles.blockquote}
      {...colorScheme.set('backgroundColor', 'hover')}
    >
      {children}
    </div>
  )
}
