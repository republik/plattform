import React from 'react'
import Serializer from 'slate-mdast-serializer'
import { renderMdast } from 'mdast-react-render'

const serializer = new Serializer()

export const Markdown = ({children, schema}) => {
  return (
    <div>
      {renderMdast(serializer.parse(children), schema)}
      <pre style={{backgroundColor: '#fff', padding: 20, margin: '0 -20px -20px -20px', overflow: 'auto'}}>
        <code style={{fontFamily: '"Roboto Mono", monospace'}}>
          {children.trim()}
        </code>
      </pre>
    </div>
  )
}
