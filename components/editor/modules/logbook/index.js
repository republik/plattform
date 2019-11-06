import React from 'react'
import MarkdownSerializer from 'slate-mdast-serializer'
import { Block } from 'slate'

import injectBlock from '../../utils/injectBlock'
import { matchBlock, createBlockButton, buttonStyles } from '../../utils'

export const getSubmodules = options => {
  const [titleModule, creditsModule] = options.subModules
  return {
    titleModule,
    creditsModule
  }
}

const getNewItem = options => {
  const [titleModule, creditsModule] = options.subModules
  return () =>
    Block.create({
      kind: 'block',
      type: options.TYPE,
      nodes: [
        Block.create({
          kind: 'block',
          type: titleModule.TYPE
        }),
        Block.create({
          kind: 'block',
          type: creditsModule.TYPE
        })
      ]
    })
}

const fromMdast = options => {
  const { titleModule, creditsModule } = getSubmodules(options)
  return (node, index, parent, rest) => {
    const title = node.children.filter(titleModule.rule.matchMdast)
    const credits = node.children.filter(creditsModule.rule.matchMdast)

    const deserializedTitle = (title &&
      titleModule.helpers.serializer.fromMdast(title)) || [
      {
        kind: 'block',
        type: titleModule.TYPE
      }
    ]

    const deserializedCredits =
      credits && credits.length
        ? creditsModule.helpers.serializer.fromMdast(credits)
        : [
            {
              kind: 'block',
              type: creditsModule.TYPE
            }
          ]

    return {
      kind: 'block',
      type: options.TYPE,
      data: node.data,
      nodes: [...deserializedTitle, ...deserializedCredits]
    }
  }
}

const toMdast = options => {
  const { titleModule, creditsModule } = getSubmodules(options)
  return (node, index, parent, rest) => {
    const [title, credits] = node.nodes

    return {
      type: 'zone',
      identifier: 'LOGBOOK',
      children: [
        titleModule.helpers.serializer.toMdast(title),
        creditsModule.helpers.serializer.toMdast(credits)
      ]
    }
  }
}

export const getSerializer = options => {
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

export const logbookPlugin = options => {
  const { titleModule, creditsModule } = getSubmodules(options)
  const Logbook = options.rule.component
  return {
    renderNode: ({ node, children, attributes }) => {
      if (!matchBlock(options.TYPE)(node)) {
        return
      }
      return <Logbook attributes={attributes}>{children}</Logbook>
    },
    onKeyDown(event, change) {
      const isBackspace = event.key === 'Backspace'
      if (!isBackspace) return

      const { value } = change
      const logBook = value.document.getClosest(
        value.startBlock.key,
        matchBlock(options.TYPE)
      )
      if (!logBook) return

      const isEmpty = !logBook.text

      if (isBackspace) {
        event.preventDefault()
        if (isEmpty) {
          return change.removeNodeByKey(logBook.key)
        }
      }
    },
    schema: {
      blocks: {
        [options.TYPE]: {
          nodes: [
            {
              types: [titleModule.TYPE],
              min: 1
            },
            {
              types: [creditsModule.TYPE],
              min: 1,
              max: 1
            }
          ]
        }
      }
    }
  }
}

export const createLogbookButton = options =>
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
  plugins: [logbookPlugin(options)],
  ui: {
    insertButtons: [createLogbookButton(options)]
  }
})
