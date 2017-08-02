import React from 'react'

export default {
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
