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
        renderNode({ node, editor: { value }, attributes }) {
          if (!zone.match(node)) return

          const series = node.data.get('series')
          console.log('node', node.data)
          const active = value.blocks.some(block => block.key === node.key)
          return (
            <div
              style={{
                transition: 'outline-color 0.2s',
                outline: '4px solid transparent',
                outlineColor: active ? colors.primary : 'transparent'
              }}
              {...attributes}
            >
              <SeriesNav
                document={{
                  meta: {
                    series
                  }
                }}
                inline={node.data.get('inline')}
                ActionBar={DummyActionBar}
                PayNote={NoOp}
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
