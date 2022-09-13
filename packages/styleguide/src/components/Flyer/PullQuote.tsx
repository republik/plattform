import React from 'react'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { fontStyles } from '../Typography'

export const PullQuote = ({ children, attributes }) => (
  <blockquote
    {...attributes}
    {...css({ margin: '0 0 14px', [mUp]: { margin: '0 0 19px' } })}
  >
    {children}
  </blockquote>
)

export const PullQuoteText = ({ children, attributes }) => (
  <div
    {...attributes}
    {...css({
      ...fontStyles.sansSerifBold,
      backgroundColor: '#000',
      color: '#F2F2F2',
      padding: 16,
      fontSize: 22,
      lineHeight: 1.318,
      [mUp]: {
        padding: 20,
        fontSize: 39,
        lineHeight: 1.179,
      },
    })}
  >
    <q
      style={{
        quotes: `"«" "»" "‹" "›"`,
      }}
    >
      {children}
    </q>
  </div>
)
