import React from 'react'

const BlockQuote = ({ children }) => (
  <blockquote
    style={{
      margin: '0',
      padding: '30px auto'
    }}
  >
    {children}
  </blockquote>
)

export default BlockQuote
