import React from 'react'

export default {
  Blocks: {
    P: ({ children }) =>
      <p>
        {children}
      </p>,
    H1: ({ children }) =>
      <h1>
        {children}
      </h1>,
    H2: ({ children }) =>
      <h2>
        {children}
      </h2>,
    H3: ({ children }) =>
      <h3>
        {children}
      </h3>,
    Lead: ({ children }) =>
      <p className="lead">
        {children}
      </p>
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
