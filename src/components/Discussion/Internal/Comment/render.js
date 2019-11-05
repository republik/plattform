import React from 'react'
import { renderMdast } from 'mdast-react-render'

import createCommentSchema from '../../../../templates/Comment'
import colors from '../../../../theme/colors'

const schema = createCommentSchema()

const MissingNode = ({ node, children }) => {
  return (
    <span
      style={{
        textDecoration: `underline wavy ${colors.divider}`,
        display: 'inline-block',
        margin: 4
      }}
      title={`Markdown element "${node.type}" wird nicht unterstützt.`}
    >
      {children || node.value || node.identifier || '[…]'}
    </span>
  )
}

export const renderCommentMdast = content =>
  renderMdast(content, schema, { MissingNode })
