import MarkdownSerializer from 'slate-mdast-serializer'
import { Block } from 'slate'
import React from 'react'
import { matchBlock, buttonStyles } from '../../utils'

import { Label, Interaction } from '@project-r/styleguide'
import UIForm from '../../UIForm'

export const getNewBlock = options => () => {
  const [
    teaserModule
  ] = options.subModules

  return Block.create({
    type: options.TYPE,
    nodes: [
      teaserModule.helpers.newItem(),
      teaserModule.helpers.newItem(),
      teaserModule.helpers.newItem()
    ]
  })
}

export const fromMdast = ({
  TYPE,
  subModules
}) => {
  const [ teaserModule ] = subModules
  const teaserSerializer = teaserModule.helpers.serializer
  return (
    node,
    index,
    parent,
    rest
  ) => ({
    kind: 'block',
    type: TYPE,
    nodes: node.children.map(
      (v, i) => teaserSerializer.fromMdast(v, i, node, rest)
    )
  })
}

export const toMdast = ({
  TYPE,
  subModules
}) => {
  const [ teaserModule ] = subModules
  const teaserSerializer = teaserModule.helpers.serializer
  return (
    node,
    index,
    parent,
    rest
  ) => ({
    type: 'zone',
    identifier: 'TEASERGROUP',
    children: node.nodes.map(v =>
      teaserSerializer.toMdast(v)
    )
  })
}

const AricleGroupPlugin = options => {
  const { TYPE, rule } = options
  const TeaserGroup = rule.component

  return {
    renderNode ({ editor, node, attributes, children }) {
      if (!matchBlock(TYPE)(node)) {
        return
      }

      return ([
        <TeaserGroup key='teaser' {...node.data.toJS()} attributes={{
          ...attributes,
          style: { position: 'relative' }
        }}>
          {children}
        </TeaserGroup>
      ])
    },
    schema: {
      blocks: {
        [TYPE]: {
          nodes: [
            {
              blocks: options.subModules.map(m => m.TYPE)
            }
          ]
        }
      }
    }
  }
}

const getSerializer = options => {
  return new MarkdownSerializer({
    rules: [
      {
        match: matchBlock(options.TYPE),
        matchMdast:
          options.rule.matchMdast,
        fromMdast: fromMdast(options),
        toMdast: toMdast(options)
      }
    ]
  })
}

const AricleGroupForm = options => {
  const { TYPE } = options

  const [
    teaserModule
  ] = options.subModules

  const clickHandler = (value, collection, onChange) => event => {
    event.preventDefault()
    onChange(
      value
        .change()
        .insertNodeByKey(
          collection.key,
          collection.nodes.size,
          teaserModule.helpers.newItem()
        )
    )
  }

  return ({ value, onChange }) => {
    const collection = value.document.getClosest(
      value.startBlock.key,
      matchBlock(TYPE)
    )
    if (!collection) {
      return null
    }
    return <UIForm>
      <Interaction.P>
        <Label>Teaser-Liste</Label>
        <span
          {...buttonStyles.insert}
          data-visible
          onMouseDown={clickHandler(value, collection, onChange)}
        >
          Teaser hinzufügen
        </span>
      </Interaction.P>
    </UIForm>
  }
}

export default options => ({
  helpers: {
    serializer: getSerializer(options),
    newItem: getNewBlock(options)
  },
  rule: getSerializer(options).rules[0],
  plugins: [
    AricleGroupPlugin(options)
  ],
  ui: {
    insertButtons: [
      // TeaserGroupButton(options)
    ],
    forms: [
      AricleGroupForm(options)
    ]
  }
})
