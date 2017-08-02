import React from 'react'
import { P, H1, H2, H3, Lead } from '@project-r/styleguide'

export default {
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
    H3: ({ children }) =>
      <H3>
        {children}
      </H3>,
    Lead: ({ children }) =>
      <Lead>
        {children}
      </Lead>
  },
  Marks: {
    Bold: ({ children }) =>
      <strong>
        {children}
      </strong>,
    Italic: ({ children }) =>
      <em>
        {children}
      </em>,
    Strikethrough: ({ children }) =>
      <del>
        {children}
      </del>,
    Underline: ({ children }) =>
      <u>
        {children}
      </u>
  },
  UI: {
    MarkButton: new Proxy(
      {},
      {
        get: (target, type) => ({ active, ...props }) =>
          <span {...props}>
            {type}
          </span>
      }
    ),
    BlockButton: new Proxy(
      {},
      {
        get: (target, type) => ({ active, ...props }) =>
          <span {...props}>
            {type}
          </span>
      }
    )
  }
}
