import React from 'react'
import { CustomDescendant, NodeTemplate } from './custom-types'
import SlateEditor from './components/editor'
import ErrorBoundary from '../ErrorBoundary'

const Editor: React.FC<{
  value: CustomDescendant[]
  setValue: (t: CustomDescendant[]) => void
  structure?: NodeTemplate[]
}> = ({ value, setValue, structure }) => (
  <ErrorBoundary showException={true}>
    <div style={{ maxWidth: 690 }}>
      <SlateEditor value={value} setValue={setValue} structure={structure} />
    </div>
  </ErrorBoundary>
)

export default Editor
