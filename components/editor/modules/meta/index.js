import React from 'react'

import MetaData from './ui'

export default ({rule, TYPE, context = {}}) => {
  const options = rule.editorOptions || {}

  return {
    TYPE,
    helpers: {},
    changes: {},
    plugins: [
      {
        renderEditor ({value, readOnly, children}, editor) {
          return (
            <div>
              {children}
              <MetaData value={value} readOnly={readOnly} editor={editor}
                {...options}
                mdastSchema={context.mdastSchema}
                contextMeta={context.meta} />
            </div>
          )
        }
      }
    ]
  }
}
