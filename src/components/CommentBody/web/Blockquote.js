import React from 'react'
import { css } from 'glamor'

import { useColorContext } from '../../Colors/useColorContext'
import { mUp } from '../../../theme/mediaQueries'
import { serifRegular14, serifRegular16 } from '../../Typography/styles'
import { convertStyleToRem } from '../../Typography/utils'

const styles = {
  blockquote: css({
    borderLeftWidth: 2,
    borderLeftStyle: 'solid',
    margin: '20px auto',
    padding: '15px',
    [mUp]: {
      padding: '25px'
    }
  }),
  paragraph: css({
    margin: '6px 0',
    ...convertStyleToRem(serifRegular14),
    [mUp]: {
      ...convertStyleToRem(serifRegular16),
      margin: '10px 0'
    },
    '&:first-child': {
      marginTop: 0
    },
    '&:last-child': {
      marginBottom: 0
    }
  })
}

export const BlockQuoteParagraph = ({ children }) => (
  <p {...styles.paragraph}>{children}</p>
)

export const BlockQuoteNested = ({ children }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...styles.blockquote}
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
