import React from 'react'
import { A } from '@project-r/styleguide'

export default {
  Link: {
    Inlines: {
      Link: ({ children, ...props }) =>
        <A {...props}>
          {children}
        </A>
    }
  }
}
