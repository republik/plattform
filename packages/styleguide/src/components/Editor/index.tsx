import React from 'react'
import { CustomDescendant, EditorConfig, NodeTemplate } from './custom-types'
import SlateEditor from './components/editor'
import ErrorBoundary from '../ErrorBoundary'

const Editor: React.FC<{
  value: CustomDescendant[]
  setValue: (t: CustomDescendant[]) => void
  structure?: NodeTemplate[]
  config: EditorConfig
}> = ({ value, setValue, structure, config }) => (
  <ErrorBoundary showException={true}>
    <div style={{ maxWidth: 690 }}>
      <SlateEditor
        value={value}
        setValue={setValue}
        structure={structure}
        config={config}
      />
    </div>
  </ErrorBoundary>
)

export default Editor
