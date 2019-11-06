import React from 'react'
import { matchBlock } from '../../utils'
import { createRemoveEmptyKeyHandler } from '../../utils/keyHandlers'
import { Block } from 'slate'

import shortId from 'shortid'

import { getSerializer, getSubmodules } from './serializer'

import { TeaserButton, TeaserInlineUI, TeaserForm } from './ui'

export const getData = data => ({
  url: null,
  textPosition: 'topleft',
  color: '#000',
  bgColor: '#fff',
  center: false,
  image: null,
  byline: null,
  kind: 'editorial',
  titleSize: 'standard',
  teaserType: 'frontImage',
  reverse: false,
  portrait: true,
  showImage: true,
  onlyImage: false,
  id: (data && data.id) || shortId(),
  ...(data || {})
})

export const getNewBlock = options => () => {
  const {
    titleModule,
    subjectModule,
    leadModule,
    formatModule,
    paragraphModule
  } = getSubmodules(options)

  const data = getData({
    teaserType: options.rule.editorOptions.teaserType,
    ...options.rule.editorOptions.defaultValues
  })

  const res = Block.create({
    type: options.TYPE,
    data: {
      ...data,
      module: 'teaser'
    },
    nodes: [
      Block.create({
        type: formatModule.TYPE,
        data
      }),
      Block.create({
        type: titleModule.TYPE,
        data
      }),
      Block.create({
        type: subjectModule.TYPE,
        data
      }),
      Block.create({
        type: leadModule.TYPE,
        data
      }),
      Block.create({
        type: paragraphModule.TYPE,
        data
      })
    ]
  })
  return res
}

const teaserPlugin = options => {
  const { TYPE, rule } = options
  const Teaser = rule.component

  return {
    renderNode({ editor, node, attributes, children }) {
      if (!matchBlock(TYPE)(node) && !matchBlock(`${TYPE}_VOID`)(node)) {
        return
      }

      const image =
        node.data.get('showImage') === true
          ? node.data.get('image') || '/static/placeholder.png'
          : null

      const data = node.data.toJS()

      const compiledTeaser = (
        <Teaser key='teaser' {...data} image={image} attributes={attributes}>
          {children}
        </Teaser>
      )

      if (options.rule.editorOptions.showUI === false) {
        return compiledTeaser
      }

      const teaser = editor.value.blocks.reduce(
        (memo, node) =>
          memo || editor.value.document.getFurthest(node.key, matchBlock(TYPE)),
        undefined
      )

      const isSelected = teaser === node && !editor.value.isBlurred

      return [
        isSelected && <TeaserInlineUI key='ui' node={node} editor={editor} />,
        compiledTeaser
      ]
    },
    onKeyDown: createRemoveEmptyKeyHandler({
      TYPE,
      isEmpty: node => !node.text.trim() && !node.data.get('image')
    })
  }
}

export default options => {
  return {
    helpers: {
      serializer: getSerializer(options),
      newItem: getNewBlock(options)
    },
    plugins: [teaserPlugin(options)],
    ui: {
      insertButtons: options.rule.editorOptions.insertButtonText
        ? [TeaserButton(options)]
        : [],
      forms: [TeaserForm(options)]
    }
  }
}
