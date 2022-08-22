import React from 'react'

export const PullQuote = ({ children, attributes }) => (
  <blockquote {...attributes}>{children}</blockquote>
)

export const PullQuoteText = ({ children, attributes }) => (
  <div
    {...attributes}
    style={{
      backgroundColor: '#0E755A',
      color: 'white',
      fontFamily: 'GT America',
      fontWeight: 700,
      fontSize: 40,
      textAlign: 'center',
      padding: 20,
    }}
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
