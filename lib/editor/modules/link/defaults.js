import React from 'react'

export default {
  Link: {
    Constants: {
      LINK: 'Link'
    },
    Inlines: {
      Link: ({ children, ...props }) =>
        <a {...props}>
          {children}
        </a>
    },
    UI: {
      Button: ({ active, ...props }) =>
        <span {...props}>Link</span>
    }
  }
}
