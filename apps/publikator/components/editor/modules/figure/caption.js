import React from 'react'
import MarkdownSerializer from 'slate-mdast-serializer'
import { Block } from 'slate'
import { matchBlock } from '../../utils'
import {
  createStaticKeyHandler,
  createSoftBreakKeyHandler
} from '../../utils/keyHandlers'
import { Inline } from '../../Placeholder'

const getSerializer = options => {
  const [bylineModule, ...subModules] = options.subModules
  const inlineSerializer = new MarkdownSerializer({
    rules: subModules
      .reduce(
        (a, m) =>
          a.concat(
            m.helpers && m.helpers.serializer && m.helpers.serializer.rules
          ),
        []
      )
      .filter(Boolean)
      .concat({
        matchMdast: node => node.type === 'break',
        fromMdast: () => ({
          kind: 'text',
          leaves: [{ kind: 'leaf', text: '\n', marks: [] }]
        })
      })
  })

  const fromMdast = (node, index, parent, rest) => {
    const captionNodes = node.children.filter(n => n.type !== 'emphasis')
    const byline = node.children.find(n => n.type === 'emphasis') || {
      type: 'emphasis',
      children: []
    }
    const bylineNodes = byline.children

    const res = {
      kind: 'block',
      type: options.TYPE,
      nodes: [
        {
          kind: 'block',
          type: 'CAPTION_TEXT',
          nodes: inlineSerializer.fromMdast(captionNodes, 0, node, rest)
        },
        {
          kind: 'block',
          type: bylineModule.TYPE,
          nodes: bylineModule.helpers.serializer.fromMdast(
            bylineNodes,
            0,
            node,
            rest
          )
        }
      ]
    }
    return res
  }

  const toMdast = (object, index, parent, rest) => {
    const [caption, byline] = object.nodes

    const children = [
      ...inlineSerializer.toMdast(caption.nodes, 0, object, rest)
    ]
    const bylineChildren = bylineModule.helpers.serializer.toMdast(
      byline.nodes,
      1,
      object,
      rest
    )

    if (
      bylineChildren.length &&
      !(bylineChildren.length === 1 && bylineChildren[0].value === '')
    ) {
      children.push({
        type: 'emphasis',
        children: bylineChildren
      })
    }

    const res = {
      type: 'paragraph',
      children
    }
    return res
  }

  return new MarkdownSerializer({
    rules: [
      {
        match: matchBlock(options.TYPE),
        matchMdast: options.rule.matchMdast,
        fromMdast,
        toMdast
      }
    ]
  })
}

const captionPlugin = ({ TYPE, rule, subModules }) => {
  const Caption = rule.component

  const [bylineModule] = subModules

  const { placeholder } = rule.editorOptions || {}

  const { placeholder: bylinePlaceholder } =
    bylineModule.rule.editorOptions || {}

  const Byline = bylineModule.rule.component

  const matchCaption = matchBlock(TYPE)

  const textSoftBreakHandler = createSoftBreakKeyHandler({
    TYPE: 'CAPTION_TEXT'
  })
  const textStaticHandler = createStaticKeyHandler({
    TYPE: 'CAPTION_TEXT',
    rule: { editorOptions: {} }
  })

  const textKeyHandler = (...args) => {
    const res = textSoftBreakHandler(...args)
    if (res) {
      return res
    }
    return textStaticHandler(...args)
  }

  const bylineKeyHandler = createStaticKeyHandler({
    TYPE: bylineModule.TYPE,
    rule
  })

  const captionKeyHandler = (event, change) => {
    const res = textKeyHandler(event, change)
    if (res) {
      return res
    }
    return bylineKeyHandler(event, change)
  }

  return {
    onKeyDown: captionKeyHandler,
    renderNode({ children, node, attributes }) {
      if (
        !matchBlock('CAPTION_TEXT')(node) &&
        !matchCaption(node) &&
        !matchBlock(bylineModule.TYPE)(node)
      ) {
        return
      }

      if (matchCaption(node)) {
        return (
          <Caption
            attributes={{ ...attributes }}
            data={node.data.toJS()}
            {...node.data.toJS()}
          >
            {children}
          </Caption>
        )
      }
      if (matchBlock('CAPTION_TEXT')(node)) {
        return (
          <span style={{ display: 'inline' }} {...attributes}>
            {children}{' '}
          </span>
        )
      }
      if (matchBlock(bylineModule.TYPE)(node)) {
        return <Byline attributes={attributes}>{children}</Byline>
      }
    },
    renderPlaceholder:
      placeholder &&
      (({ node }) => {
        if (
          !matchBlock('CAPTION_TEXT')(node) &&
          !matchBlock(bylineModule.TYPE)(node)
        )
          return
        if (node.text.length) return null

        if (matchBlock('CAPTION_TEXT')(node)) {
          return <Inline>{placeholder}</Inline>
        } else {
          return <Inline>{bylinePlaceholder}</Inline>
        }
      }),
    schema: {
      blocks: {
        [TYPE]: {
          nodes: [
            {
              types: ['CAPTION_TEXT'],
              kinds: ['block'],
              min: 1,
              max: 1
            },
            {
              types: [bylineModule.TYPE],
              kinds: ['block'],
              min: 1,
              max: 1
            }
          ],
          normalize(change, reason, { node, index, child }) {
            switch (reason) {
              case 'child_kind_invalid':
                change.wrapBlockByKey(child.key, {
                  kind: 'block',
                  type: 'CAPTION_TEXT'
                })
                break
              case 'child_required':
                change.insertNodeByKey(node.key, index, {
                  kind: 'block',
                  type: index > 0 ? bylineModule.TYPE : 'CAPTION_TEXT'
                })
            }
          }
        }
      }
    }
  }
}

export default options => ({
  TYPE: options.TYPE,
  rule: options.rule,
  helpers: {
    serializer: getSerializer(options),
    newBlock: () => Block.create(options.TYPE)
  },
  plugins: [captionPlugin(options)]
})
