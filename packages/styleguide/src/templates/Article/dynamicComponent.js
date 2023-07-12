import React from 'react'

import { matchZone } from '@republik/mdast-react-render'

import DynamicComponent from '../../components/DynamicComponent'

import { ResizableContainer } from './Container'

const createDynamicComponent = ({
  t,
  dynamicComponentRequire,
  dynamicComponentIdentifiers,
  insertButtonText,
  type,
}) => ({
  matchMdast: matchZone('DYNAMIC_COMPONENT'),
  component: ({ showException, raw = false, size, attributes, ...props }) => (
    <ResizableContainer
      attributes={attributes}
      raw={raw}
      size={size}
      t={t}
      showException={showException}
    >
      <DynamicComponent {...props} />
    </ResizableContainer>
  ),
  props: (node) => {
    const html = node.children.find(
      (c) => c.type === 'code' && c.lang === 'html',
    )
    return {
      raw: node.data.raw,
      size: node.data.size,
      src: node.data.src,
      identifier: node.data.identifier,
      html: html && html.value,
      props: node.data.props,
      loader: node.data.loader,
      require: dynamicComponentRequire,
      identifiers: dynamicComponentIdentifiers || {},
    }
  },
  editorModule: 'dynamiccomponent',
  editorOptions: {
    type,
    insertTypes: ['PARAGRAPH'],
    insertButtonText,
  },
  isVoid: true,
})

export default createDynamicComponent
