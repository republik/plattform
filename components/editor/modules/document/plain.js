import { Document as SlateDocument } from 'slate'
import { timeHour } from 'd3-time'

import MarkdownSerializer from 'slate-mdast-serializer'

export default ({rule, subModules, TYPE}) => {
  const centerModule = subModules.find(m => m.name === 'center')
  if (!centerModule) {
    throw new Error('Missing center submodule')
  }
  const titleModule = subModules.find(m => m.name === 'title')
  if (!titleModule) {
    throw new Error('Missing title submodule')
  }
  const figureModule = subModules.find(m => m.name === 'figure')

  const childSerializer = new MarkdownSerializer({
    rules: subModules.reduce(
      (a, m) => a.concat(
        m.helpers && m.helpers.serializer &&
        m.helpers.serializer.rules
      ),
      []
    ).filter(Boolean)
  })

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
    fromMdast: (node, index, parent, rest) => {
      node.children.forEach((child, index) => {
        // ToDo: match against rule.rules.matchMdast and wrap in center if no match
      })

      const documentNode = {
        data: node.meta,
        kind: 'document',
        nodes: childSerializer.fromMdast(node.children, 0, node, rest)
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
    toMdast: (object, index, parent, rest) => {
      return {
        type: 'root',
        meta: object.data,
        children: childSerializer.toMdast(object.nodes, 0, object, rest)
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

<section><h6>${titleModule.TYPE}</h6>

# ${title}

Lead

Von [Franz Kafka](<>) (Text) und [Everett Collection]() (Bilder), 13. Juli 2017

<hr/></section>

<section><h6>${centerModule.TYPE}</h6>

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
        validateNode: (node) => {
          if (node.kind !== 'document') return

          const adjacentCenter = node.nodes.find((n, i) => (
            i && n.type === centerModule.TYPE && node.nodes.get(i - 1).type === centerModule.TYPE
          ))
          if (!adjacentCenter) return

          return change => {
            change.mergeNodeByKey(adjacentCenter.key)
          }
        },
        schema: {
          document: {
            nodes: [
              figureModule && {
                types: [figureModule.TYPE], min: 0, max: 1
              },
              {
                types: [titleModule.TYPE], min: 1, max: 1
              },
              {
                types: subModules
                  .filter(module => module !== titleModule)
                  .map(module => module.TYPE),
                min: 1
              }
            ].filter(Boolean),
            first: {
              types: [titleModule.TYPE, figureModule && figureModule.TYPE].filter(Boolean)
            },
            last: {
              types: [centerModule.TYPE]
            },
            normalize: (change, reason, {node, index, child}) => {
              if (reason === 'child_required') {
                change.insertNodeByKey(
                  node.key,
                  index,
                  {
                    kind: 'block',
                    type: node.nodes.find(n => n.type === titleModule.TYPE)
                      ? centerModule.TYPE
                      : titleModule.TYPE
                  }
                )
              }
              if (reason === 'child_type_invalid') {
                change.setNodeByKey(
                  child.key,
                  {
                    type: index === 0
                      ? titleModule.TYPE
                      : centerModule.TYPE
                  }
                )
              }
              if (reason === 'first_child_kind_invalid' || reason === 'first_child_type_invalid') {
                change.insertNodeByKey(
                  node.key,
                  0,
                  {
                    kind: 'block',
                    type: titleModule.TYPE
                  }
                )
              }
              if (reason === 'last_child_type_invalid') {
                change.insertNodeByKey(
                  node.key,
                  node.nodes.size,
                  {
                    kind: 'block',
                    type: centerModule.TYPE
                  }
                )
              }
            }
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
