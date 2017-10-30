import { Document as SlateDocument } from 'slate'

import MarkdownSerializer from '../../../../lib/serializer'
import { findOrCreate } from '../../utils/serializationValidation'

export default ({rule, subModules, TYPE}) => {
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
    const cover = documentNode.nodes
      .find(n => n.type === coverModule.TYPE && n.kind === 'block')
    if (!cover) {
      return null
    }

    const title = cover.nodes.first()
    const lead = cover.nodes.get(1)

    const newData = data
      .set('auto', true)
      .set('title', title ? title.text : '')
      .set('description', lead ? lead.text : '')
      .set('image', cover.data.get('src'))

    return data.equals(newData)
      ? null
      : newData
  }

  const documentRule = {
    match: object => object.kind === 'document',
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, visitChildren) => {
      const cover = findOrCreate(node.children, {
        type: 'zone', identifier: coverModule.TYPE
      }, {
        children: []
      })

      let center = findOrCreate(node.children, {
        type: 'zone', identifier: centerModule.TYPE
      }, {
        children: []
      })

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
          coverSerializer.fromMdast(cover),
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
        kind: 'state'
      }
    },
    toMdast: (object, index, parent, visitChildren, context) => {
      const cover = findOrCreate(object.nodes, { kind: 'block', type: coverModule.TYPE })
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
          coverSerializer.toMdast(cover),
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

  const newDocument = ({title}) => serializer.deserialize(
`<section><h6>${coverModule.TYPE}</h6>

# ${title}

<hr/></section>

<section><h6>${centerModule.TYPE}</h6>

Ladies and Gentlemen,

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
    components: {
      Container
    },
    changes: {},
    plugins: [
      {
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
            ]
          }
        },
        onBeforeChange: (change) => {
          const newData = autoMeta(change.state.document)

          if (newData) {
            change.setNodeByKey(change.state.document.key, {
              data: newData
            })
            return change
          }
        }
      }
    ]
  }
}
