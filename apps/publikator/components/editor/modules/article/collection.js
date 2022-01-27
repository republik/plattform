import React from 'react'
import MarkdownSerializer from 'slate-mdast-serializer'
import { Label, Field, Checkbox } from '@project-r/styleguide'
import { Block } from 'slate'

import { buttonStyles, matchBlock } from '../../utils'
import { createRemoveEmptyKeyHandler } from '../../utils/keyHandlers'

import injectBlock from '../../utils/injectBlock'
import UIForm from '../../UIForm'

const getNewBlock = options => {
  const { headerModule, articleGroupModule } = getSubmodules(options)
  return () =>
    Block.create({
      kind: 'block',
      type: options.TYPE,
      nodes: [
        Block.create({
          kind: 'block',
          type: headerModule.TYPE
        }),
        articleGroupModule.helpers.newItem()
      ]
    })
}

export const getData = data => ({
  membersOnly: true,
  unauthorizedText: '',
  ...(data || {})
})

export const getSubmodules = options => {
  const [headerModule, articleGroupModule] = options.subModules
  return {
    headerModule,
    articleGroupModule
  }
}

export const fromMdast = options => {
  const { TYPE } = options
  const { headerModule, articleGroupModule } = getSubmodules(options)

  return (node, index, parent, rest) => ({
    kind: 'block',
    type: TYPE,
    data: getData(node.data),
    nodes: [
      headerModule.helpers.serializer.fromMdast(
        node.children[0],
        0,
        node,
        rest
      ),
      articleGroupModule.helpers.serializer.fromMdast(
        node.children[1],
        1,
        node,
        rest
      )
    ]
  })
}

export const toMdast = options => {
  const { headerModule, articleGroupModule } = getSubmodules(options)

  return (node, index, parent, rest) => ({
    type: 'zone',
    identifier: 'ARTICLECOLLECTION',
    data: {
      ...getData(node.data)
    },
    children: [
      headerModule.helpers.serializer.toMdast(node.nodes[0], 0, node, rest),
      articleGroupModule.helpers.serializer.toMdast(
        node.nodes[1],
        1,
        node,
        rest
      )
    ]
  })
}

export const articleCollectionPlugin = options => {
  const ArticleCollection = options.rule.component

  return {
    renderNode({ node, children, attributes }) {
      if (matchBlock(options.TYPE)(node)) {
        return (
          <ArticleCollection attributes={attributes}>
            {children}
          </ArticleCollection>
        )
      }
    },
    onKeyDown: createRemoveEmptyKeyHandler({
      TYPE: options.TYPE,
      isEmpty: node => !node.text.trim()
    })
  }
}

export const articleCollectionButton = options => {
  const articleCollectionButtonClickHandler = (
    disabled,
    value,
    onChange
  ) => event => {
    event.preventDefault()
    if (!disabled) {
      onChange(value.change().call(injectBlock, getNewBlock(options)()))
    }
  }

  const insertTypes = options.rule.editorOptions.insertTypes || []
  return ({ value, onChange }) => {
    const disabled =
      value.isBlurred || !value.blocks.every(n => insertTypes.includes(n.type))
    return (
      <span
        {...buttonStyles.insert}
        data-disabled={disabled}
        data-visible
        onMouseDown={articleCollectionButtonClickHandler(
          disabled,
          value,
          onChange
        )}
      >
        {options.rule.editorOptions.insertButtonText}
      </span>
    )
  }
}

export const getSerializer = options => {
  return new MarkdownSerializer({
    rules: [
      {
        matchMdast: options.rule.matchMdast,
        match: matchBlock(options.TYPE),
        fromMdast: fromMdast(options),
        toMdast: toMdast(options)
      }
    ]
  })
}

export const articleCollectionForm = options => {
  return ({ value, onChange }) => {
    const articleCollection = value.blocks.reduce(
      (memo, node) =>
        memo || value.document.getFurthest(node.key, matchBlock(options.TYPE)),
      undefined
    )
    if (!articleCollection) {
      return null
    }
    return (
      <UIForm>
        <Label>Artikelsammlung</Label>
        <Checkbox
          checked={articleCollection.data.get('membersOnly')}
          onChange={(_, checked) => {
            onChange(
              value.change().setNodeByKey(articleCollection.key, {
                data: articleCollection.data.set('membersOnly', checked)
              })
            )
          }}
        >
          Nur für Members sichtbar?
        </Checkbox>
        <Field
          label='Nachricht für Nicht-Members'
          value={articleCollection.data.get('unauthorizedText') || ''}
          onChange={(_, text) => {
            onChange(
              value.change().setNodeByKey(articleCollection.key, {
                data: articleCollection.data.set('unauthorizedText', text)
              })
            )
          }}
        />
      </UIForm>
    )
  }
}

export default options => ({
  helpers: {
    serializer: getSerializer(options),
    newBlock: getNewBlock(options)
    // isEmpty: isEmpty(options)
  },
  plugins: [articleCollectionPlugin(options)],
  ui: {
    insertButtons: [articleCollectionButton(options)],
    forms: [articleCollectionForm(options)]
  }
})
