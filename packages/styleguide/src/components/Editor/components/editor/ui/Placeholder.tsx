import React from 'react'
import { css } from 'glamor'
import { useSlate } from 'slate-react'
import { NodeEntry } from 'slate'
import { CustomText } from '../../../custom-types'
import { selectPlaceholder } from '../helpers/text'

const styles = {
  inInline: css({
    cursor: 'text',
    opacity: 0.333,
    ':empty::after': {
      content: 'attr(data-text)'
    }
  })
}

export const Placeholder: React.FC<{
  node: NodeEntry<CustomText>
}> = ({ node }) => {
  const editor = useSlate()
  const onClick = () => {
    selectPlaceholder(editor, node)
  }
  return (
    <span
      {...styles.inInline}
      style={{ userSelect: 'none' }}
      contentEditable={false}
      onClick={onClick}
      data-text={node[0].placeholder}
    />
  )
}
