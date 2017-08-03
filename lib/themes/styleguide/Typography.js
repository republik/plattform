import React from 'react'
import { P, H1, H2, Lead } from '@project-r/styleguide'

export default {
  Typography: {
    Blocks: {
      P: ({ children }) =>
        <P>
          {children}
        </P>,
      H1: ({ children }) =>
        <H1>
          {children}
        </H1>,
      H2: ({ children }) =>
        <H2>
          {children}m
        </H2>,
      Lead: ({ children }) =>
        <Lead>
          {children}
        </Lead>
    }
  }
}
