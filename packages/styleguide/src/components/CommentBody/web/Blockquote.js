import React from 'react'
import { css } from 'glamor'

import { useColorContext } from '../../Colors/useColorContext'
import { mUp } from '../../../theme/mediaQueries'
import { serifRegular14, serifRegular16 } from '../../Typography/styles'
import { convertStyleToRem } from '../../Typography/utils'

const styles = {
  blockquote: css({
    margin: '20px auto',
    '& figcaption': {
      marginLeft: 0,
      marginRight: 0,
    },
  }),
  nestedBlockQuote: css({
    borderLeftWidth: 2,
    borderLeftStyle: 'solid',
  }),
  paragraph: css({
    margin: 0,
    padding: '0 15px 6px 15px',
    ...convertStyleToRem(serifRegular14),
    [mUp]: {
      ...convertStyleToRem(serifRegular16),
      padding: '0 25px 10px 25px',
      '&:first-child': {
        paddingTop: '20px',
      },
      '&:last-of-type': {
        paddingBottom: '20px',
      },
    },
    '&:first-child': {
      paddingTop: '12px',
    },
    '&:last-of-type': {
      paddingBottom: '12px',
    },
  }),
}

export const BlockQuoteParagraph = ({ attributes, children }) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...attributes}
      {...styles.paragraph}
      {...colorScheme.set('backgroundColor', 'hover')}
    >
      {children}
    </p>
  )
}

export const BlockQuoteNested = ({ attributes, children }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...attributes}
      {...styles.blockquote}
      {...styles.nestedBlockQuote}
      {...colorScheme.set('backgroundColor', 'hover')}
      {...colorScheme.set('borderColor', 'divider')}
    >
      {children}
    </div>
  )
}

export default ({ attributes, children }) => {
  return (
    <div {...attributes} {...styles.blockquote}>
      {children}
    </div>
  )
}
