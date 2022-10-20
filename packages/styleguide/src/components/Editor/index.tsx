import React from 'react'
import { CustomDescendant, EditorConfig, NodeTemplate } from './custom-types'
import SlateEditor from './Core'
import ErrorBoundary from '../ErrorBoundary'

const Editor: React.FC<{
  value: CustomDescendant[]
  setValue: (t: CustomDescendant[]) => void
  structure?: NodeTemplate[]
  config: EditorConfig
}> = ({ value, setValue, structure, config }) => {
  return (
    <ErrorBoundary showException={true}>
      <SlateEditor
        value={value}
        setValue={setValue}
        structure={structure}
        config={config}
      />
    </ErrorBoundary>
  )
}

export default Editor
