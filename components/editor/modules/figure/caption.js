import MarkdownSerializer from 'slate-mdast-serializer'
import { Block } from 'slate'
import { matchBlock } from '../../utils'
import Placeholder from '../../Placeholder'

export const getSerializer = options => {
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
            leaves: [{ text: '\n' }]
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
        fromMdast,
        toMdast,
        matchMdast: options.rule.matchMdast
      }
    ]
  })
}

const focusPrevious = change => {
  const { value } = change
  const previousBlock = !!value.startBlock &&
    value.document.getPreviousBlock(value.startBlock.key)

  if (previousBlock) {
    return change.collapseToEndOf(
      previousBlock
    )
  }
  return true
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

const captionPlugin = options => {
  const Caption = options.component
  const placeholder = options.rule.editorOptions.placeholder

  return {
    renderNode (
      children,
      node,
      attributes
    ) {
      if (!matchBlock(options.type)(node)) {
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
      if (!matchBlock(options.TYPE)(node)) return
      if (node.text.length) return null

      return <Placeholder>{placeholder}</Placeholder>
    }),
    onKeyDown (event, change) {
      const isBackspace = event.key === 'Backspace'
      const isEnter = event.key === 'Enter'
      const isTab = event.key === 'Tab'

      if (!isEnter && !isBackspace && !isTab) return

      const { value } = change
      const inSelection = value.blocks.some(matchBlock(options.TYPE))

      if (!inSelection) return

      event.preventDefault()

      if (isEnter || isTab) {
        return focusNext(change)
      }

      if (isBackspace && value.blocks.some(v => value.selection.hasStartAtStartOf(v))) {
        return focusPrevious(change)
      }
    }
  }
}

export default options => ({
  helpers: {
    serializer: getSerializer(options),
    newBlock: () => Block.create(options.TYPE)
  },
  plugins: [
    captionPlugin(options)
  ]
})
