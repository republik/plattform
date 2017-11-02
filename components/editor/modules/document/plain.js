import { Document as SlateDocument } from 'slate'
import { timeHour } from 'd3-time'

import MarkdownSerializer from '../../../../lib/serializer'
import { findOrCreate } from '../../utils/serialization'

export default ({rule, subModules, TYPE}) => {
  const centerModule = subModules.find(m => m.name === 'center')
  if (!centerModule) {
    throw new Error('Missing center submodule')
  }

  const centerSerializer = centerModule.helpers.serializer

  const autoMeta = documentNode => {
    const data = documentNode.data
    const autoMeta = !data || !data.delete('template').size || data.get('auto')
    if (!autoMeta) {
      return null
    }
    const center = documentNode.nodes
      .find(n => n.type === centerModule.TYPE && n.kind === 'block')
    if (!center) {
      return null
    }
    const title = center.nodes.first()

    const newData = data
      .set('auto', true)
      .set('title', title ? title.text : '')
      .set('publishDate', timeHour.ceil(new Date()).toISOString())

    return data.equals(newData)
      ? null
      : newData
  }

  const documentRule = {
    match: object => object.kind === 'document',
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, visitChildren) => {
      let center = findOrCreate(node.children, {
        type: 'zone', identifier: centerModule.TYPE
      }, {
        children: []
      })

      const centerIndex = node.children.indexOf(center)
      const before = []
      const after = []
      node.children.forEach((child, index) => {
        if (child !== center) {
          if (index > centerIndex) {
            after.push(child)
          } else {
            before.push(child)
          }
        }
      })
      if (before.length || after.length) {
        center = {
          ...center,
          children: [
            ...before,
            ...center.children,
            ...after
          ]
        }
      }

      const documentNode = {
        data: node.meta,
        kind: 'document',
        nodes: [
          centerSerializer.fromMdast(center)
        ]
      }

      const newData = autoMeta(
        SlateDocument.fromJSON(documentNode)
      )
      if (newData) {
        documentNode.data = newData.toJS()
      }

      return {
        document: documentNode,
        kind: 'value'
      }
    },
    toMdast: (object, index, parent, visitChildren, context) => {
      const center = findOrCreate(
        object.nodes,
        { kind: 'block', type: centerModule.TYPE },
        { nodes: [] }
      )

      return {
        type: 'root',
        meta: object.data,
        children: [
          centerSerializer.toMdast(center)
        ]
      }
    }
  }

  const serializer = new MarkdownSerializer({
    rules: [
      documentRule
    ]
  })

  const newDocument = ({title, template}) => serializer.deserialize(
`---
template: ${template}
---

<section><h6>${centerModule.TYPE}</h6>

# ${title}

Hurray!

<hr/></section>
`
  )

  const Container = rule.component

  return {
    TYPE,
    helpers: {
      serializer,
      newDocument
    },
    changes: {},
    plugins: [
      {
        renderEditor: ({children}) => <Container>{children}</Container>,
        schema: {
          document: {
            nodes: [
              {
                types: [centerModule.TYPE],
                kinds: ['block'],
                min: 1,
                max: 1
              }
            ]
          }
        },
        onChange: (change) => {
          const newData = autoMeta(change.value.document)

          if (newData) {
            change.setNodeByKey(change.value.document.key, {
              data: newData
            })
            return change
          }
        }
      }
    ]
  }
}
