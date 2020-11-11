import React from 'react'

import MetaData from './ui'
import { ColorContextProvider } from '@project-r/styleguide'

export default ({ rule, TYPE, context = {} }) => {
  const options = rule.editorOptions || {}

  return {
    TYPE,
    helpers: {},
    changes: {},
    plugins: [
      {
        renderEditor({ value, children }, editor) {
          return (
            <div>
              <ColorContextProvider colorSchemeKey='light'>
                {children}
                {children}
                <MetaData
                  value={value}
                  editor={editor}
                  {...options}
                  mdastSchema={context.mdastSchema}
                  contextMeta={context.meta}
                  isTemplate={context.isTemplate}
                />
              </ColorContextProvider>
            </div>
          )
        }
      }
    ]
  }
}
