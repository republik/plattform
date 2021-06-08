import React from 'react'
import { colors, IconButton, ProgressCircle } from '@project-r/styleguide'
import {
  ReadingTimeIcon,
  BookmarkIcon,
  DiscussionIcon
} from '@project-r/styleguide/icons'
import { Block } from 'slate'

import { matchBlock } from '../../utils'
import MarkdownSerializer from 'slate-mdast-serializer'

import { TeaserInlineUI } from '../teaser/ui'

// gleich wie special
import createUi from './ui'

const DummyActionBar = () => (
  <span style={{ display: 'flex' }}>
    <IconButton Icon={ReadingTimeIcon} label="10'" labelShort="10'" />
    <IconButton Icon={BookmarkIcon} />
    <IconButton
      Icon={() => <ProgressCircle progress={23} size={24} />}
      label='23%'
      labelShort='23%'
    />
    <IconButton
      fill='#00AA00'
      Icon={DiscussionIcon}
      label='30'
      labelShort='30'
    />
  </span>
)

const NoOp = () => null
const DefaultLink = ({ children }) => children

const SeriesNavPlugin = ({ rule, subModules, TYPE }) => {
  const zone = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, rest) => {
      const { series } = rest.context
      return {
        kind: 'block',
        type: TYPE,
        data: {
          identifier: node.identifier,
          ...node.data,
          series
        },
        isVoid: true
      }
    },
    toMdast: object => {
      // omit series
      const { identifier, series: _, ...data } = object.data
      return {
        type: 'zone',
        identifier,
        data: data,
        children: []
      }
    }
  }

  const newBlock = data =>
    Block.fromJSON(
      zone.fromMdast(
        {
          type: 'zone',
          identifier: 'SERIES_NAV',
          data: {}
        },
        0,
        undefined,
        {
          context: data
        }
      )
    )

  const serializer = new MarkdownSerializer({
    rules: [zone]
  })

  const SeriesNav = rule.component

  return {
    TYPE,
    helpers: {
      serializer,
      newBlock
    },
    changes: {},
    ui: createUi({ TYPE, newBlock, zone }),
    plugins: [
      {
        renderNode({ node, editor, editor: { value }, attributes }) {
          if (!zone.match(node)) return

          const titleNode = value.document.findDescendant(
            node => node.type === 'TITLE'
          )
          const series = titleNode.data.get('series')

          const isSelected = value.blocks.some(block => block.key === node.key)
          return (
            <div {...attributes}>
              {isSelected && (
                <TeaserInlineUI
                  key='ui'
                  copyable={false}
                  node={node}
                  editor={editor}
                />
              )}
              <SeriesNav
                documentId={undefined}
                series={series}
                inline={!node.data.get('grid')}
                ActionBar={DummyActionBar}
                PayNote={undefined}
                Link={DefaultLink}
              />
            </div>
          )
        },
        schema: {
          [TYPE]: {
            isVoid: true
          }
        }
      }
    ]
  }
}

export default SeriesNavPlugin
