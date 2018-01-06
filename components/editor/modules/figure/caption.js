import MarkdownSerializer from 'slate-mdast-serializer'
import { Block } from 'slate'
import { matchBlock } from '../../utils'
import Placeholder from '../../Placeholder'

const getSerializer = options => {
  const inlineSerializer = new MarkdownSerializer(
    {
      rules: options.subModules
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
    return {
      kind: 'block',
      type: options.TYPE,
      nodes: inlineSerializer.fromMdast(
        node.children,
        0,
        node,
        rest
      )
    }
  }

  const toMdast = (
    object,
    index,
    parent,
    rest
  ) => {
    return {
      type: 'paragraph',
      children: inlineSerializer.toMdast(
        object.nodes,
        0,
        object,
        rest
      )
    }
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

const focusNext = change => {
  const { value } = change
  const nextBlock = value.document.getNextBlock(value.endBlock.key)
  if (nextBlock) {
    return change.collapseToStartOf(
      nextBlock
    )
  }
  return true
}

const captionPlugin = ({TYPE, rule}) => {
  const Caption = rule.component
  const {
    placeholder
  } = rule.editorOptions || {}

  const matchCaption = matchBlock(TYPE)

  return {
    renderNode ({
      children,
      node,
      attributes
    }) {
      if (!matchCaption(node)) {
        return
      }

      return (
        <Caption
          attributes={{...attributes, style: {position: 'relative'}}}
          data={node.data.toJS()} {...node.data.toJS()}>
          <span style={{position: 'relative', display: 'block'}}>
            {children}
          </span>
        </Caption>
      )
    },
    renderPlaceholder: placeholder && (({node}) => {
      if (!matchCaption(node)) return
      if (node.text.length) return null

      return <Placeholder>{placeholder}</Placeholder>
    }),
    onKeyDown (event, change) {
      const isBackspace = event.key === 'Backspace'
      const isEnter = event.key === 'Enter'
      const isTab = event.key === 'Tab'

      if (!isEnter && !isBackspace && !isTab) return

      const { value } = change
      const inSelection = value.blocks.some(matchCaption)

      if (!inSelection) return

      event.preventDefault()

      if (isEnter || isTab) {
        return focusNext(change)
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
