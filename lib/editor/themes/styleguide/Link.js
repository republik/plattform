import React from 'react'
import { A } from '@project-r/styleguide'

export default {
  Inlines: {
    Link: ({ children, ...props }) =>
      <A {...props}>
        {children}
      </A>
  },
  UI: {
    Button: ({ active, ...props }) =>
      <span {...props}>Link</span>
  }
}
