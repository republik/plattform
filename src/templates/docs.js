import React from 'react'
import { renderMdast } from 'mdast-react-render'
import { parse } from '@orbiting/remark-preset'

export const Markdown = ({children, schema}) => {
  return (
    <div>
      {renderMdast(parse(children), schema)}
      <pre style={{backgroundColor: '#fff', padding: 20, margin: '20px -20px -20px -20px', overflow: 'auto'}}>
        <code style={{fontFamily: '"Roboto Mono", monospace'}}>
          {children.trim()}
        </code>
      </pre>
    </div>
  )
}
