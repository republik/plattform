import React from 'react'

import ErrorBoundary from '@project-r/styleguide/src/components/ErrorBoundary'
import { Figure } from '@project-r/styleguide/src/components/Figure'
import DynamicComponent from '@republik/dynamic-components'

import { matchZone } from 'mdast-react-render/lib/utils'

const createDynamicComponent = ({
  t,
  dynamicComponentRequire,
  dynamicComponentIdentifiers,
  insertButtonText,
  type,
}) => ({
  matchMdast: matchZone('DYNAMIC_COMPONENT'),
  component: ({ showException, raw = false, size, attributes, ...props }) => {
    const content = (
      <ErrorBoundary
        showException={showException}
        failureMessage={t('styleguide/DynamicComponent/error')}
      >
        <DynamicComponent size={size} {...props} />
      </ErrorBoundary>
    )

    if (raw) {
      return content
    }

    return (
      <Figure size={size} attributes={attributes}>
        {content}
      </Figure>
    )
  },
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
