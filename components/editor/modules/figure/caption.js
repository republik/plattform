import MarkdownSerializer from 'slate-mdast-serializer'
import { Block } from 'slate'
import { matchBlock } from '../../utils'
import { staticKeyHandler } from '../../utils/keyHandlers'
import { Inline } from '../../Placeholder'

const getSerializer = options => {
  const [ byLineModule, ...subModules ] = options.subModules
  const inlineSerializer = new MarkdownSerializer(
    {
      rules: subModules
        .reduce(
          (a, m) =>
            a.concat(
              m.helpers &&
                m.helpers.serializer &&
                m.helpers.serializer
                  .rules
            ),
          []
        )
        .filter(Boolean)
        .concat({
          matchMdast: node =>
            node.type === 'break',
          fromMdast: () => ({
            kind: 'text',
            leaves: [{kind: 'leaf', text: '\n', marks: []}]
          })
        })
    }
  )

  const fromMdast = (
    node,
    index,
    parent,
    rest
  ) => {
    const captionNodes = node.children.filter(n => n.type !== 'emphasis')
    const byLine = node.children.find(n => n.type === 'emphasis')
    const byLineNodes = byLine.children || []

    const res = {
      kind: 'block',
      type: options.TYPE,
      nodes: [
        {
          kind: 'block',
          type: 'CAPTION_TEXT',
          nodes: inlineSerializer.fromMdast(
            captionNodes
          )
        },
        {
          kind: 'block',
          type: byLineModule.TYPE,
          nodes: byLineModule.helpers.serializer.fromMdast(
            byLineNodes
          )
        }
      ]
    }
    return res
  }

  const toMdast = (
    object,
    index,
    parent,
    rest
  ) => {
    const [
      caption,
      byLine
    ] = object.nodes

    const res = {
      type: 'paragraph',
      children: [
        ...inlineSerializer.toMdast(
          caption.nodes,
          0,
          object,
          rest
        ),
        {
          type: 'emphasis',
          children: byLineModule.helpers.serializer.toMdast(byLine.nodes)
        }
      ]
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

const captionPlugin = ({TYPE, rule, subModules}) => {
  const Caption = rule.component

  const [ byLineModule ] = subModules

  const {
    placeholder
  } = rule.editorOptions || {}

  const {
    placeholder: byLinePlaceholder
  } = byLineModule.rule.editorOptions || {}

  const ByLine = byLineModule.rule.component

  const matchCaption = matchBlock(TYPE)

  const textKeyHandler = staticKeyHandler({
    TYPE: 'CAPTION_TEXT',
    rule: { editorOptions: {} }
  })

  const byLineKeyHandler = staticKeyHandler({
    TYPE: byLineModule.TYPE,
    rule
  })

  const keyHandler = (event, change) => {
    const res = textKeyHandler(event, change)
    if (res) {
      return res
    }
    return byLineKeyHandler(event, change)
  }

  return {
    onKeyDown: keyHandler,
    renderNode ({
      children,
      node,
      attributes
    }) {
      if (
        !matchBlock('CAPTION_TEXT')(node) &&
        !matchCaption(node) &&
        !matchBlock(byLineModule.TYPE)(node)
      ) {
        return
      }

      if (matchCaption(node)) {
        return (
          <Caption
            attributes={{...attributes}}
            data={node.data.toJS()} {...node.data.toJS()}>
            {children}
          </Caption>
        )
      }
      if (matchBlock('CAPTION_TEXT')(node)) {
        return (
          <span style={{ display: 'inline-block' }} {...attributes}>{children}{' '}</span>
        )
      }
      if (matchBlock(byLineModule.TYPE)(node)) {
        return (
          <ByLine
            attributes={attributes}>
            {children}
          </ByLine>
        )
      }
    },
    renderPlaceholder: placeholder && (({node}) => {
      if (
        !matchBlock('CAPTION_TEXT')(node) &&
        !matchBlock(byLineModule.TYPE)(node)
      ) return
      if (node.text.length) return null

      if (matchBlock('CAPTION_TEXT')(node)) {
        return <Inline>{placeholder}</Inline>
      } else {
        return <Inline>{byLinePlaceholder}</Inline>
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
              types: [byLineModule.TYPE],
              kinds: ['block'],
              min: 1,
              max: 1
            }
          ],
          normalize (change, reason, { node, index, child }) {
            switch (reason) {
              case 'child_kind_invalid':
                change.wrapBlockByKey(
                  child.key,
                  {
                    kind: 'block',
                    type: 'CAPTION_TEXT'
                  }
                )
                break
              case 'child_required':
                change.insertNodeByKey(
                  node.key,
                  index,
                  {
                    kind: 'block',
                    type: index > 0
                      ? byLineModule.TYPE
                      : 'CAPTION_TEXT'
                  }
                )
            }
          }
        }
      }
    }
  }
}

export default options => ({
  TYPE: options.TYPE,
  helpers: {
    serializer: getSerializer(options),
    newBlock: () => Block.create(options.TYPE)
  },
  plugins: [
    captionPlugin(options)
  ]
})
