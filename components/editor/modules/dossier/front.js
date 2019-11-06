import React from 'react'
import MarkdownSerializer from 'slate-mdast-serializer'
import { Block } from 'slate'

import shortId from 'shortid'

import { allBlocks, parent, childIndex, depth } from '../../utils/selection'

import { buttonStyles, matchBlock } from '../../utils'

import { TeaserInlineUI, TeaserForm } from '../teaser/ui'

const getData = data => ({
  module: 'teasergroup', // used by publicator internally
  url: null,
  id: (data && data.id) || shortId(),
  ...data
})

const getNewBlock = options => {
  const {
    headlineModule,
    introTeaserModule,
    articleCollectionModule,
    outroTextModule
  } = getSubmodules(options)

  return () =>
    Block.create({
      kind: 'block',
      type: options.TYPE,
      data: getData({
        teaserType:
          options.rule.editorOptions.teaserType || 'frontArticleCollection',
        ...options.rule.editorOptions.defaultValues
      }),
      nodes: [
        headlineModule && {
          kind: 'block',
          type: headlineModule.TYPE
        },
        introTeaserModule && introTeaserModule.helpers.newItem(),
        articleCollectionModule.helpers.newItem(),
        outroTextModule && {
          kind: 'block',
          type: outroTextModule.TYPE
        }
      ].filter(Boolean)
    })
}

const getSubmodules = ({ subModules }) => {
  const headlineModule = subModules.find(m => m.name === 'headline')
  const introTeaserModule = subModules.find(m => m.name === 'dossierIntro')
  const articleCollectionModule = subModules.find(
    m => m.name === 'articleGroup'
  )
  const outroTextModule = subModules.find(m => m.name === 'paragraph')

  return {
    headlineModule,
    introTeaserModule,
    articleCollectionModule,
    outroTextModule
  }
}

const FrontDossierPlugin = options => {
  const Group = options.rule.component

  return {
    renderNode({ node, children, attributes, editor }) {
      const teaser = editor.value.blocks.reduce(
        (memo, node) =>
          memo ||
          editor.value.document.getFurthest(node.key, matchBlock(options.TYPE)),
        undefined
      )

      if (matchBlock(options.TYPE)(node)) {
        const isSelected = teaser === node && !editor.value.isBlurred
        return [
          isSelected && <TeaserInlineUI key='ui' node={node} editor={editor} />,
          <Group {...node.data.toJS()} key='content' attributes={attributes}>
            {children}
          </Group>
        ]
      }
    }
  }
}

const FrontDossierButton = options => {
  const articleDossierButtonClickHandler = (value, onChange) => event => {
    event.preventDefault()
    const nodes = allBlocks(value)
      .filter(n => depth(value, n.key) < 2)
      .filter(n => {
        return ['teaser', 'teasergroup'].includes(n.data.get('module'))
      })
    const node = nodes.first()
    onChange(
      value
        .change()
        .insertNodeByKey(
          parent(value, node.key).key,
          childIndex(value, node.key),
          getNewBlock(options)()
        )
    )
  }

  return ({ value, onChange }) => {
    const disabled = value.isBlurred || value.isExpanded
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

const getSerializer = options => {
  const childSerializer = new MarkdownSerializer({
    rules: options.subModules
      .reduce(
        (a, m) =>
          a.concat(
            m.helpers && m.helpers.serializer && m.helpers.serializer.rules
          ),
        []
      )
      .filter(Boolean)
  })

  const { outroTextModule } = getSubmodules(options)

  return new MarkdownSerializer({
    rules: [
      {
        matchMdast: options.rule.matchMdast,
        match: matchBlock(options.TYPE),
        fromMdast: (node, index, parent, rest) => {
          const children = [].concat(node.children)
          const lastChild = children[children.length - 1]
          if (
            outroTextModule &&
            (!lastChild || lastChild.type !== 'paragraph')
          ) {
            children.push({
              type: 'paragraph',
              children: []
            })
          }
          return {
            kind: 'block',
            type: options.TYPE,
            data: getData(node.data),
            nodes: childSerializer.fromMdast(children, 0, node, rest)
          }
        },
        toMdast: (object, index, parent, rest) => {
          const { module, ...data } = object.data
          return {
            type: 'zone',
            identifier: 'TEASER',
            data,
            children: childSerializer.toMdast(object.nodes, 0, object, rest)
          }
        }
      }
    ]
  })
}

export default options => ({
  helpers: {
    serializer: getSerializer(options),
    newBlock: getNewBlock(options)
  },
  plugins: [FrontDossierPlugin(options)],
  ui: {
    insertButtons: [FrontDossierButton(options)],
    forms: options.rule.editorOptions.formOptions
      ? [TeaserForm({ subModuleResolver: getSubmodules, ...options })]
      : []
  }
})
