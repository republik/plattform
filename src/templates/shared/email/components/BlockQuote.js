import React from 'react'

const BlockQuote = ({ children }) => (
  <blockquote
    style={{
      margin: '30px auto'
    }}
  >
    {children}
  </blockquote>
)

export default BlockQuote
