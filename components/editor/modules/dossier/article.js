import MarkdownSerializer from 'slate-mdast-serializer'
import { Block } from 'slate'

import { buttonStyles, matchBlock } from '../../utils'
import { createRemoveEmptyKeyHandler } from '../../utils/keyHandlers'

import injectBlock from '../../utils/injectBlock'

const getNewBlock = options => {
  const { headerModule, articleCollectionModule } = getSubmodules(options)
  return () => Block.create({
    kind: 'block',
    type: options.TYPE,
    nodes: [
      Block.create({
        kind: 'block',
        data: {
          teaserType: 'articleDossier'
        },
        type: headerModule.TYPE
      }),
      articleCollectionModule.helpers.newItem()
    ]
  })
}

export const getSubmodules = options => {
  const [
    headerModule,
    articleCollectionModule
  ] = options.subModules
  return {
    headerModule,
    articleCollectionModule
  }
}

export const fromMdast = options => {
  const { TYPE } = options
  const { headerModule, articleCollectionModule } = getSubmodules(options)

  return (node, index, parent, rest) => ({
    kind: 'block',
    type: TYPE,
    data: node.data,
    nodes: [
      headerModule.helpers.serializer.fromMdast(node.children[0], 0, node, rest),
      articleCollectionModule.helpers.serializer.fromMdast(node.children[1], 1, node, rest)
    ]
  })
}

export const toMdast = options => {
  const { headerModule, articleCollectionModule } = getSubmodules(options)

  return (node, index, parent, rest) => ({
    type: 'zone',
    identifier: 'TEASER',
    data: {
      teaserType: 'articleDossier',
      ...node.data
    },
    children: [
      headerModule.helpers.serializer.toMdast(node.nodes[0], 0, node, rest),
      articleCollectionModule.helpers.serializer.toMdast(node.nodes[1], 1, node, rest)
    ]
  })
}

export const ArticleDossierPlugin = options => {
  const ArticleDossier = options.rule.component

  return {
    renderNode ({ node, children, attributes }) {
      if (matchBlock(options.TYPE)(node)) {
        return <ArticleDossier attributes={attributes}>{children}</ArticleDossier>
      }
    },
    onKeyDown: createRemoveEmptyKeyHandler({
      TYPE: options.TYPE,
      isEmpty: node =>
        !node.text.trim()

    })
  }
}

export const ArticleDossierButton = options => {
  const articleDossierButtonClickHandler = (disabled, value, onChange) => event => {
    event.preventDefault()
    if (!disabled) {
      onChange(value
        .change()
        .call(
          injectBlock,
          getNewBlock(options)()
        )
      )
    }
  }

  const insertTypes = options.rule.editorOptions.insertTypes || []
  return ({ value, onChange }) => {
    const disabled = value.isBlurred ||
      !value.blocks.every(
        n => insertTypes.includes(n.type)
      )
    return (
      <span
        {...buttonStyles.insert}
        data-disabled={disabled}
        data-visible
        onMouseDown={articleDossierButtonClickHandler(disabled, value, onChange)}
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
    newBlock: getNewBlock(options)
    // isEmpty: isEmpty(options)
  },
  plugins: [
    ArticleDossierPlugin(options)
  ],
  ui: {
    insertButtons: [
      ArticleDossierButton(options)
    ]
  }
})
