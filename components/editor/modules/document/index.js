import React from 'react'
import { Document as SlateDocument } from 'slate'
import { parse } from '@orbiting/remark-preset'

import MarkdownSerializer from 'slate-mdast-serializer'
import { findOrCreate } from '../../utils/serialization'
import slugify from '../../../../lib/utils/slug'

export default ({ rule, subModules, TYPE }) => {
  const coverModule = subModules.find(m => m.name === 'cover')
  if (!coverModule) {
    throw new Error('Missing cover submodule')
  }
  const centerModule = subModules.find(m => m.name === 'center')
  if (!centerModule) {
    throw new Error('Missing center submodule')
  }

  const coverSerializer = coverModule.helpers.serializer
  const centerSerializer = centerModule.helpers.serializer

  const autoMeta = documentNode => {
    const data = documentNode.data
    const autoMeta = !data || !data.size || data.get('auto')
    if (!autoMeta) {
      return null
    }
    const cover = documentNode.nodes.find(
      n => n.type === coverModule.TYPE && n.kind === 'block'
    )
    if (!cover) {
      return null
    }

    const title = cover.nodes.first()
    const lead = cover.nodes.get(1)

    const newData = data
      .set('auto', true)
      .set('feed', true)
      .set('title', title ? title.text : '')
      .set('slug', title ? slugify(title.text) : '')
      .set('description', lead ? lead.text : '')
      .set('image', cover.data.get('src'))

    return data.equals(newData) ? null : newData
  }

  const documentRule = {
    match: object => object.kind === 'document',
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, rest) => {
      const cover = findOrCreate(
        node.children,
        {
          type: 'zone',
          identifier: coverModule.TYPE
        },
        {
          children: []
        }
      )

      let center = findOrCreate(
        node.children,
        {
          type: 'zone',
          identifier: centerModule.TYPE
        },
        {
          children: []
        }
      )

      const centerIndex = node.children.indexOf(center)
      const before = []
      const after = []
      node.children.forEach((child, index) => {
        if (child !== cover && child !== center) {
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
          children: [...before, ...center.children, ...after]
        }
      }

      const documentNode = {
        data: node.meta,
        kind: 'document',
        nodes: [
          coverSerializer.fromMdast(cover, 0, node, rest),
          centerSerializer.fromMdast(center, 1, node, rest)
        ]
      }

      const newData = autoMeta(SlateDocument.fromJSON(documentNode))
      if (newData) {
        documentNode.data = newData.toJS()
      }

      return {
        document: documentNode,
        kind: 'value'
      }
    },
    toMdast: (object, index, parent, rest) => {
      const cover = findOrCreate(object.nodes, {
        kind: 'block',
        type: coverModule.TYPE
      })
      const center = findOrCreate(
        object.nodes,
        { kind: 'block', type: centerModule.TYPE },
        { nodes: [] }
      )
      const centerIndex = object.nodes.indexOf(center)
      object.nodes.forEach((node, index) => {
        if (node !== cover && node !== center) {
          center.nodes[index > centerIndex ? 'push' : 'unshift'](node)
        }
      })
      return {
        type: 'root',
        meta: object.data,
        children: [
          coverSerializer.toMdast(cover, 0, object, rest),
          centerSerializer.toMdast(center, 1, object, rest)
        ]
      }
    }
  }

  const serializer = new MarkdownSerializer({
    rules: [documentRule]
  })

  const newDocument = ({ title }) =>
    serializer.deserialize(
      parse(
        `<section><h6>${coverModule.TYPE}</h6>

# ${title}

<hr/></section>

<section><h6>${centerModule.TYPE}</h6>

Ladies and Gentlemen,

<hr/></section>
`
      )
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
        renderEditor: ({ children }) => <Container>{children}</Container>,
        schema: {
          document: {
            nodes: [
              {
                types: [coverModule.TYPE],
                kinds: ['block'],
                min: 1,
                max: 1
              },
              {
                types: [centerModule.TYPE],
                kinds: ['block'],
                min: 1,
                max: 1
              }
            ],
            normalize: (change, reason, { node, index, child }) => {
              if (reason === 'child_required') {
                change.insertNodeByKey(node.key, index, {
                  kind: 'block',
                  type: index === 0 ? coverModule.TYPE : centerModule.TYPE
                })
              }
              if (reason === 'child_type_invalid') {
                change.setNodeByKey(child.key, {
                  type: index === 0 ? coverModule.TYPE : centerModule.TYPE
                })
              }
              if (reason === 'child_unknown') {
                if (index > 1) {
                  change.mergeNodeByKey(child.key)
                }
              }
            }
          }
        },
        onChange: change => {
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
