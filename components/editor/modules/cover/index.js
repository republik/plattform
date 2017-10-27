import React from 'react'
import { matchBlock } from '../../utils'
import addValidation, { findOrCreate } from '../../utils/serializationValidation'
import { gray2x1 } from '../../utils/placeholder'
import { createCoverForm } from './ui'
import MarkdownSerializer from '../../../../lib/serializer'

export default ({rule, subModules, TYPE}) => {
  const titleModule = subModules.find(m => m.identifier === 'TITLE')
  if (!titleModule) {
    throw new Error('Missing TITLE submodule')
  }
  const titleSerializer = titleModule.helpers.serializer

  const leadModule = subModules.find(m => m.identifier === 'LEAD')
  if (!leadModule) {
    throw new Error('Missing LEAD submodule')
  }
  const leadSerializer = leadModule.helpers.serializer

  const isCover = matchBlock(TYPE)
  const isTitle = matchBlock(titleModule.TYPE)
  const isLead = matchBlock(leadModule.TYPE)

  const Cover = rule.component

  const cover = {
    match: isCover,
    render: ({ children, node, attributes }) => (
      <Cover data={{
        src: node.data.get('src') || gray2x1,
        alt: node.data.get('alt')
      }} attributes={attributes}>
        {children}
      </Cover>
    ),
    matchMdast: (node) => node.type === 'zone' && node.identifier === TYPE,
    fromMdast: (node, index, parent, visitChildren) => {
      // fault tolerant because markdown could have been edited outside
      const deepNodes = node.children.reduce(
        (children, child) => children
          .concat(child)
          .concat(child.children),
        []
      )
      const image = findOrCreate(deepNodes, {type: 'image'})
      const imageParagraph = node.children.find(
        child => child.children && child.children.indexOf(image) !== -1
      )
      const title = findOrCreate(
        node.children,
        {type: 'heading', depth: 1},
        {children: []}
      )

      const lead = (
        node.children.find(child => child.type === 'paragraph' && child !== imageParagraph) ||
        findOrCreate(
          node.children,
          {type: 'blockquote'},
          {children: []}
        ).children[0] ||
        ({
          type: 'paragraph',
          children: []
        })
      )

      return {
        kind: 'block',
        type: TYPE,
        data: {
          src: image.url,
          alt: image.alt
        },
        nodes: [
          titleSerializer.fromMdast(title),
          leadSerializer.fromMdast(lead)
        ]
      }
    },
    toMdast: (object, index, parent, visitChildren, context) => {
      [isTitle, isLead].some((check, index) => {
        const node = object.nodes[index]
        if (!node || !check(node)) {
          context.dirty = true
          return true
        }
      })
      if (object.nodes.length > 2) {
        context.dirty = true
      }

      return {
        type: 'zone',
        identifier: TYPE,
        children: [
          {
            type: 'image',
            alt: object.data.alt,
            url: object.data.src
          },
          titleSerializer.toMdast(
            findOrCreate(object.nodes, {
              kind: 'block',
              type: titleModule.TYPE
            }, {nodes: []}), context
          ),
          leadSerializer.toMdast(
            findOrCreate(object.nodes, {
              kind: 'block',
              type: leadModule.TYPE
            }, {nodes: []}), context
          )
        ]
      }
    }
  }

  const serializer = new MarkdownSerializer({
    rules: [
      cover
    ]
  })

  addValidation(cover, serializer, TYPE)

  return {
    TYPE,
    helpers: {
      serializer
    },
    changes: {},
    ui: {
      forms: [
        createCoverForm(TYPE)
      ]
    },
    plugins: [
      {
        schema: {
          rules: [
            cover
          ]
        }
      }
    ]
  }
}
