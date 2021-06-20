import React, { useRef, useEffect } from 'react'
import { JSONEditor } from '@json-editor/json-editor'

import 'bootstrap/dist/css/bootstrap.min.css'

JSONEditor.defaults.options.theme = 'bootstrap4'

const Form = ({ schema, onChange }) => {
  const ref = useRef()

  useEffect(() => {
    const editor = new JSONEditor(ref.current, {
      schema
    })

    const onEditorChange = () => {
      const value = editor.getValue()
      if (onChange) {
        onChange(value)
      }
    }
    editor.on('change', onEditorChange)

    return () => {
      editor.off('change', onEditorChange)
      editor.destroy()
    }
  }, [])

  return <div ref={ref} />
}

export default Form
