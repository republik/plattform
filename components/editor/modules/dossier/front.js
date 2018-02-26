import MarkdownSerializer from 'slate-mdast-serializer'
import { Block } from 'slate'

import { allBlocks, parent, childIndex, depth } from '../../utils/selection'

import { buttonStyles, matchBlock } from '../../utils'

import { TeaserInlineUI } from '../teaser/ui'
import {
  getIndex,
  getParent,
  insert,
  moveUp,
  moveDown,
  remove
} from '../teaser/actions'

const isEmpty = options => {
  const { introTeaserModule, articleCollectionModule, outroTextModule } = getSubmodules(options)
  return node =>
    introTeaserModule.helpers.isEmpty(node.nodes.first()) &&
    articleCollectionModule.helpers.isEmpty(node.nodes.last()) &&
    outroTextModule.helpers.isEmpty(node.nodes.last())
}

const getNewBlock = options => {
  const { introTeaserModule, articleCollectionModule, outroTextModule } = getSubmodules(options)

  return () => Block.create({
    kind: 'block',
    type: options.TYPE,
    data: {
      teaserType: 'frontArticleCollection'
    },
    nodes: [
      introTeaserModule.helpers.newItem(),
      articleCollectionModule.helpers.newItem(),
      {
        kind: 'block',
        type: outroTextModule.TYPE
      }
    ]
  })
}

export const getSubmodules = options => {
  const [
    introTeaserModule,
    articleCollectionModule,
    outroTextModule
  ] = options.subModules
  return {
    introTeaserModule,
    articleCollectionModule,
    outroTextModule
  }
}

export const getData = data => ({
  url: null,
  textPosition: 'topleft',
  color: '',
  bgColor: '',
  center: false,
  image: null,
  kind: 'editorial',
  titleSize: 'standard',
  teaserType: 'frontImage',
  reverse: false,
  portrait: true,
  showImage: true,
  onlyImage: false,
  ...data || {}
})
export const fromMdast = options => {
  const { TYPE } = options
  const { introTeaserModule, articleCollectionModule, outroTextModule } = getSubmodules(options)

  return (node, index, parent, rest) => {
    return ({
      kind: 'block',
      type: TYPE,
      data: getData(node.data),
      nodes: [
        introTeaserModule.helpers.serializer.fromMdast(node.children[0], 0, node, rest),
        articleCollectionModule.helpers.serializer.fromMdast(node.children[1], 1, node, rest),
        outroTextModule.helpers.serializer.fromMdast(
          node.children[2] || { type: 'paragraph', children: [{ type: 'text', value: '' }] },
          2, node, rest)
      ]
    })
  }
}

export const toMdast = options => {
  const { introTeaserModule, articleCollectionModule, outroTextModule } = getSubmodules(options)

  return (node, index, parent, rest) => {
    return ({
      type: 'zone',
      identifier: 'TEASER',
      data: node.data,
      children: [
        introTeaserModule.helpers.serializer.toMdast(node.nodes[0], 0, node, rest),
        articleCollectionModule.helpers.serializer.toMdast(node.nodes[1], 1, node, rest),
        outroTextModule.helpers.serializer.toMdast(node.nodes[2], 2, node, rest)
      ]
    })
  }
}

export const FrontDossierPlugin = options => {
  const Group = options.rule.component
  const UI = TeaserInlineUI(options)

  return {
    renderNode ({ node, children, attributes, editor }) {
      const teaser = editor.value.blocks.reduce(
        (memo, node) =>
          memo || editor.value.document.getFurthest(node.key, matchBlock(options.TYPE)),
        undefined
      )

      const isSelected = teaser === node && !editor.value.isBlurred

      if (matchBlock(options.TYPE)(node)) {
        return [
          <UI
            key='ui'
            isSelected={isSelected}
            nodeKey={node.key}
            getIndex={getIndex(editor)}
            getParent={getParent(editor)}
            moveUp={moveUp(editor)}
            moveDown={moveDown(editor)}
            insert={insert(editor)}
            remove={remove(editor)}
            />,
          <Group {...node.data.toJS()} key='content' attributes={attributes}>{children}</Group>
        ]
      }
    }
  }
}

export const FrontDossierButton = options => {
  const articleDossierButtonClickHandler = (value, onChange) => event => {
    event.preventDefault()
    const nodes = allBlocks(value)
      .filter(n => depth(value, n.key) < 2)
      .filter(n => {
        return ['teaser', 'teasergroup'].includes(n.data.get('module'))
      })
    const node = nodes.first()
    onChange(
        value.change().insertNodeByKey(
          parent(value, node.key).key,
          childIndex(value, node.key),
          getNewBlock(options)()
        )
      )
  }

  return ({ value, onChange }) => {
    const disabled = (
      value.isBlurred ||
      value.isExpanded
    )
    return (
      <span
        {...buttonStyles.insert}
        data-visible
        data-disabled={disabled}
        onMouseDown={articleDossierButtonClickHandler(value, onChange)}
      >
        {options.rule.editorOptions.insertButtonText}
      </span>
    )
  }
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

export default options => ({
  helpers: {
    serializer: getSerializer(options),
    newBlock: getNewBlock(options),
    isEmpty: isEmpty(options)
  },
  plugins: [
    FrontDossierPlugin(options)
  ],
  ui: {
    insertButtons: [
      FrontDossierButton(options)
    ]
  }
})
