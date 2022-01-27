import React from 'react'
import { renderMdast } from 'mdast-react-render'
import createCommentSchema from '../../../../templates/Comment'
import { useColorContext } from '../../../Colors/useColorContext'

const schema = createCommentSchema()

const MissingNode = ({ node, children }) => {
  const [colorScheme] = useColorContext()
  return (
    <span
      style={{
        textDecorationLine: 'underline',
        textDecorationStyle: 'wavy',
        display: 'inline-block',
        margin: 4
      }}
      {...colorScheme.set('textDecorationColor', 'divider')}
      title={`Markdown element "${node.type}" wird nicht unterstützt.`}
    >
      {children || node.value || node.identifier || '[…]'}
    </span>
  )
}

export const renderCommentMdast = content =>
  renderMdast(content, schema, { MissingNode })
