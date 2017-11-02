import React from 'react'

import MetaData from './ui'

export default ({rule, TYPE}) => {
  const {
    additionalFields
  } = rule.editorOptions || {}

  return {
    TYPE,
    helpers: {},
    changes: {},
    plugins: [
      {
        renderEditor ({value, children}, editor) {
          return (
            <div>
              {children}
              <MetaData value={value} editor={editor} additionalFields={additionalFields} />
            </div>
          )
        }
      }
    ]
  }
}
