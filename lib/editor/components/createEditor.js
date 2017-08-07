import React, { createElement } from 'react'
import PropTypes from 'prop-types'
import { Editor as SlateEditor } from 'slate'

export default ({ Modules, Plugins }) => {
  let Document
  if (
    !Modules.Document ||
    !Modules.Document.Components ||
    !Modules.Document.Components.Document
  ) {
    Document = 'article'
  } else {
    Document = Modules.Document.Components.Document
  }

  const Editor = ({ state, onChange, onDocumentChange }) => {
    return createElement(Document, {}, [
      <SlateEditor
        key={'editor'}
        state={state}
        plugins={Plugins}
        onChange={onChange}
        onDocumentChange={onDocumentChange}
      />
    ])
  }

  Editor.propTypes = {
    modules: PropTypes.object,
    plugins: PropTypes.array,
    state: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onDocumentChange: PropTypes.func
  }

  return Editor
}
