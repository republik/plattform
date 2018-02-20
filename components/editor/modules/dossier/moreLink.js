import MarkdownSerializer from 'slate-mdast-serializer'
import { Block } from 'slate'
import { createStaticKeyHandler } from '../../utils/keyHandlers'

import { matchBlock } from '../../utils'

import { LinkForm } from '../link/ui'
import { Inline as InlinePlaceholder } from '../../Placeholder'

const getNewBlock = options =>
  () => Block.create({
    kind: 'block',
    type: options.TYPE,
    data: {
      title: '',
      href: ''
    }
  })

export const fromMdast = options => {
  return (node, index, parent, { visitChildren }) => ({
    kind: 'block',
    type: options.TYPE,
    data: {
      title: node.children[0].title,
      href: node.children[0].url
    },
    nodes: visitChildren(node.children[0])
  })
}

export const toMdast = options => {
  return (node, index, parent, { visitChildren }) => ({
    type: 'paragraph',
    children: [
      {
        type: 'link',
        title: node.data.title,
        url: node.data.href,
        children: visitChildren(node)
      }
    ]
  })
}

export const getSerializer = options => {
  return new MarkdownSerializer({rules: [
    {
      matchMdast: options.rule.matchMdast,
      match: matchBlock(options.TYPE),
      fromMdast: fromMdast(options),
      toMdast: toMdast(options)
    }
  ]})
}

export const MoreLinkPlugin = options => {
  const MoreLink = options.rule.component

  return {
    renderNode ({ node, children, attributes }) {
      if (matchBlock(options.TYPE)(node)) {
        return <MoreLink {...node.data.toJS()} attributes={attributes}>
          {children}
        </MoreLink>
      }
    },
    renderPlaceholder ({ node }) {
      if (matchBlock(options.TYPE)(node) && !node.text.length) {
        return <InlinePlaceholder>{options.rule.editorOptions.placeholder}</InlinePlaceholder>
      }
    },

    onKeyDown: createStaticKeyHandler(options)
  }
}

export default options => ({
  rule: options.rule,
  helpers: {
    serializer: getSerializer(options),
    newItem: getNewBlock(options)
  },
  plugins: [
    MoreLinkPlugin(options)
  ],
  ui: {
    forms: [
      LinkForm(options)
    ]
  }
})
