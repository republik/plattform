import React from 'react'
import colors from '@project-r/styleguide/src/theme/colors'

export const Link = ({ children, href, title }) => (
  <a
    href={href}
    title={title}
    style={{
      color: colors.text,
      textDecoration: 'underline',
      textDecorationSkip: 'ink',
    }}
  >
    {children}
  </a>
)
