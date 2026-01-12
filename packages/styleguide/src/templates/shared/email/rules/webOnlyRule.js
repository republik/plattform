import { matchZone } from '@republik/mdast-react-render'
import React from 'react'

const webOnlyRule = {
  matchMdast: matchZone('WEBONLY'),
  component: ({ children }) => {
    return <>{children}</>
  },
  editorModule: 'webOnly',
  editorOptions: {
    insertTypes: ['PARAGRAPH'],
    type: 'WEBONLY',
  },
}

export default webOnlyRule
