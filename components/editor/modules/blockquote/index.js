import React from 'react'
import MarkdownSerializer from 'slate-mdast-serializer'
import { Block } from 'slate'

import injectBlock from '../../utils/injectBlock'
import { matchBlock, createBlockButton, buttonStyles } from '../../utils'

const getNewItem = options => {
  const [blocktextModule, captionModule] = options.subModules
  return () =>
    Block.create({
      kind: 'block',
      type: options.TYPE,
      nodes: [
        Block.create({
          kind: 'block',
          type: blocktextModule.TYPE
        }),
        captionModule.helpers.newBlock()
      ]
    })
}

const getSubmodules = ({ subModules }) => {
  const blocktextModule = subModules.find(m => m.name === 'blocktext')
  if (!blocktextModule) {
    throw new Error('Missing blocktext submodule')
  }
  const captionModule = subModules.find(m => m.name === 'figureCaption')
  if (!captionModule) {
    throw new Error('Missing figureCaption submodule')
  }
  return {
    blocktextModule,
    captionModule
  }
}

const fromMdast = options => {
  const { blocktextModule, captionModule } = getSubmodules(options)
  return (node, index, parent, rest) => {
    const caption = node.children.filter(captionModule.rule.matchMdast)
    const blockquotes = node.children.filter(blocktextModule.rule.matchMdast)
    const serializedBlockQuotes = blockquotes.length
      ? blocktextModule.helpers.serializer.fromMdast(blockquotes)
      : [{ kind: 'block', type: blocktextModule.TYPE }]

    const serializedCaption = captionModule.helpers.serializer.fromMdast(
      caption.length
        ? caption
        : [
            {
              type: 'paragraph',
              children: [
                { type: 'text', value: '' },
                {
                  type: 'emphasis',
                  children: [{ type: 'text', value: '' }]
                }
              ]
            }
          ]
    )

    return {
      kind: 'block',
      type: options.TYPE,
      data: node.data,
      nodes: [...serializedBlockQuotes, ...serializedCaption]
    }
  }
}

const toMdast = options => {
  const { blocktextModule, captionModule } = getSubmodules(options)

  return (node, index, parent, rest) => {
    const caption = node.nodes.slice(-1)
    const paragraphs = node.nodes.slice(0, -1)

    return {
      type: 'zone',
      identifier: 'BLOCKQUOTE',
      children: [
        ...blocktextModule.helpers.serializer.toMdast(paragraphs),
        ...captionModule.helpers.serializer.toMdast(caption)
      ]
    }
  }
}

const getSerializer = options => {
  return new MarkdownSerializer({
    rules: [
      {
        match: matchBlock(options.TYPE),
        matchMdast: options.rule.matchMdast,
        fromMdast: fromMdast(options),
        toMdast: toMdast(options)
      }
    ]
  })
}

const blockQuotePlugin = options => {
  const { blocktextModule, captionModule } = getSubmodules(options)
  const BlockQuote = options.rule.component
  return {
    renderNode: ({ node, children, attributes }) => {
      if (!matchBlock(options.TYPE)(node)) {
        return
      }
      return <BlockQuote attributes={attributes}>{children}</BlockQuote>
    },
    schema: {
      blocks: {
        [options.TYPE]: {
          nodes: [
            {
              types: [blocktextModule.TYPE],
              min: 1
            },
            {
              types: [captionModule.TYPE],
              min: 1,
              max: 1
            }
          ]
        }
      }
    }
  }
}

const createBlockQuoteButton = options =>
  createBlockButton({
    type: options.TYPE,
    reducer: props => event => {
      const { onChange, value } = props
      event.preventDefault()

      return onChange(value.change().call(injectBlock, getNewItem(options)()))
    }
  })(({ active, disabled, visible, ...props }) => {
    return (
      <span
        {...buttonStyles.block}
        {...props}
        data-active={active}
        data-disabled={disabled}
        data-visible={visible}
      >
        {options.rule.editorOptions.insertButtonText}
      </span>
    )
  })

export default options => ({
  helpers: {
    serializer: getSerializer(options),
    newBlock: getNewItem(options)
  },
  plugins: [blockQuotePlugin(options)],
  ui: {
    insertButtons: [createBlockQuoteButton(options)]
  }
})
