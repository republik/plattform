import React from 'react'
import { Document as SlateDocument } from 'slate'
import { parse } from '@orbiting/remark-preset'

import { swissTime } from '../../../../lib/utils/format'
import slugify from '../../../../lib/utils/slug'
import MarkdownSerializer from 'slate-mdast-serializer'

import createPasteHtml from './createPasteHtml'
import { safeDump } from 'js-yaml'

const pubDateFormat = swissTime.format('%d.%m.%Y')

export default ({ rule, subModules, TYPE }) => {
  const centerModule = subModules.find(m => m.name === 'center')
  if (!centerModule) {
    throw new Error('Missing center submodule')
  }
  const titleModule = subModules.find(m => m.name === 'title')
  const figureModule = subModules.find(m => m.name === 'figure')
  const dynamicComponentModule = subModules.find(
    m => m.name === 'dynamiccomponent'
  )

  const childSerializer = new MarkdownSerializer({
    rules: subModules
      .reduce(
        (a, m) =>
          a.concat(
            m.helpers && m.helpers.serializer && m.helpers.serializer.rules
          ),
        []
      )
      .filter(Boolean)
  })

  const autoMeta = documentNode => {
    const data = documentNode.data
    const autoMeta = !data || !data.delete('template').size || data.get('auto')
    if (!autoMeta) {
      return null
    }

    let newData = data
      .set('auto', true)
      .set('feed', true)
      .set('gallery', true)

    const title =
      titleModule &&
      documentNode.nodes.find(
        n => n.type === titleModule.TYPE && n.kind === 'block'
      )
    const fallbackTitle = data.get('title')

    if (title) {
      const headline = title.nodes.first()
      const headlineText = headline ? headline.text : ''
      const subject = title.nodes.get(1)
      const lead = title.nodes.get(2)

      newData = newData
        .set('title', headlineText)
        .set('subject', subject ? subject.text : '')
        .set('description', lead ? lead.text : '')
        .set('slug', slugify(headlineText))
    } else if (fallbackTitle) {
      if (data.get('template') === 'editorialNewsletter') {
        newData = newData
          .set('emailSubject', fallbackTitle)
          .set('slug', slugify(fallbackTitle))
      }
    }

    if (data.get('template') === 'discussion') {
      newData = newData.set('collapsable', true)
    }

    return data.equals(newData) ? null : newData
  }

  const hasParent = (type, document, key) => {
    const parent = document.getParent(key)
    if (!parent) return
    return parent.type === type ? true : hasParent(type, document, parent.key)
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
        nodes: childSerializer.fromMdast(node.children, 0, node, {
          context: {
            ...rest.context,
            // pass format to title through context
            meta: node.meta,
            format: node.format,
            section: node.section
          }
        })
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
      return {
        type: 'root',
        meta: object.data,
        children: childSerializer.toMdast(object.nodes, 0, object, rest)
      }
    }
  }

  const serializer = new MarkdownSerializer({
    rules: [documentRule]
  })

  const newDocument = ({ title = '', schema = '' }, me) =>
    serializer.deserialize(
      parse(`---
${safeDump({ template: schema, title, auto: true })}
---
${
  titleModule
    ? `
<section><h6>${titleModule.TYPE}</h6>

# ${title}

Lead

Von ${me ? `[${me.name}](/~${me.id})` : '[Autor](<>)'}, ${pubDateFormat(
        new Date()
      )}

<hr/></section>

`
    : ''
}
<section><h6>${centerModule.TYPE}</h6>

${titleModule ? 'Text' : title}

<hr/></section>
`)
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
        onPaste: createPasteHtml(centerModule, figureModule),
        renderEditor: ({ children, value }) => (
          <Container meta={value.document.data}>{children}</Container>
        ),
        validateNode: node => {
          if (node.kind !== 'document') return

          const adjacentCenter = node.nodes.find(
            (n, i) =>
              i &&
              n.type === centerModule.TYPE &&
              node.nodes.get(i - 1).type === centerModule.TYPE
          )
          if (!adjacentCenter) return

          return change => {
            change.mergeNodeByKey(adjacentCenter.key)
          }
        },
        schema: {
          document: {
            nodes: [
              dynamicComponentModule && {
                types: [dynamicComponentModule.TYPE],
                min: 0,
                max: 1
              },
              figureModule && {
                types: [figureModule.TYPE],
                min: 0,
                max: 1
              },
              titleModule && {
                types: [titleModule.TYPE],
                min: 1,
                max: 1
              },
              {
                types: subModules
                  .filter(module => module !== titleModule)
                  .map(module => module.TYPE),
                min: 1
              }
            ].filter(Boolean),
            first: (titleModule || figureModule) && {
              types: [
                titleModule && titleModule.TYPE,
                figureModule && figureModule.TYPE,
                dynamicComponentModule && dynamicComponentModule.TYPE
              ].filter(Boolean)
            },
            last: {
              types: [centerModule.TYPE]
            },
            normalize: (change, reason, { node, index, child }) => {
              if (reason === 'child_required') {
                change.insertNodeByKey(node.key, index, {
                  kind: 'block',
                  type:
                    !titleModule ||
                    node.nodes.find(n => n.type === titleModule.TYPE)
                      ? centerModule.TYPE
                      : titleModule.TYPE
                })
              }
              if (reason === 'child_type_invalid') {
                change.setNodeByKey(child.key, {
                  type:
                    index === 0 && titleModule
                      ? titleModule.TYPE
                      : centerModule.TYPE
                })
              }
              if (
                reason === 'first_child_kind_invalid' ||
                reason === 'first_child_type_invalid'
              ) {
                change.insertNodeByKey(node.key, 0, {
                  kind: 'block',
                  type: titleModule ? titleModule.TYPE : figureModule.TYPE
                })
              }
              if (reason === 'last_child_type_invalid') {
                change.insertNodeByKey(node.key, node.nodes.size, {
                  kind: 'block',
                  type: centerModule.TYPE
                })
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
