import React from 'react'
import { CustomDescendant, EditorConfig } from './custom-types'
import SlateEditor from './Core'
import ErrorBoundary from '../ErrorBoundary'

const Editor: React.FC<{
  value: CustomDescendant[]
  setValue: (t: CustomDescendant[]) => void
  config: EditorConfig
}> = ({ value, setValue, config }) => {
  return (
    <ErrorBoundary showException={true}>
      <SlateEditor value={value} setValue={setValue} config={config} />
    </ErrorBoundary>
  )
}

export default Editor
