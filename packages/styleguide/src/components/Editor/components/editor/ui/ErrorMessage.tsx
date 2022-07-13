import React from 'react'
import { useColorContext } from '../../../../Colors/ColorContext'
import { Interaction } from '../../../../Typography'
import { useSlate } from 'slate-react'

const ErrorMessage: React.FC<{
  attributes: any
  error: string
}> = ({ error, attributes, children }) => {
  const [colorScheme] = useColorContext()
  const editor = useSlate()
  const P = editor.customConfig.schema.paragraph || Interaction.P
  return (
    <div {...attributes} style={{ userSelect: 'none' }} contentEditable={false}>
      <P>
        <span {...colorScheme.set('color', 'error')}>Error: {error}</span>
      </P>
      {children}
    </div>
  )
}

export default ErrorMessage
