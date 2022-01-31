import React from 'react'
import { CustomDescendant, NodeTemplate } from './custom-types'
import SlateEditor from './components/editor'

const Editor: React.FC<{
  value: CustomDescendant[]
  setValue: (t: CustomDescendant[]) => void
  structure?: NodeTemplate[]
}> = ({ value, setValue, structure }) => (
  <div style={{ maxWidth: 690 }}>
    <SlateEditor value={value} setValue={setValue} structure={structure} />
  </div>
)

export default Editor
