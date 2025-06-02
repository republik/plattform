import { Block } from 'slate'

import { matchBlock } from '../../utils'
import MarkdownSerializer from '@republik/slate-mdast-serializer'

import { TeaserInlineUI } from '../teaser/ui'

import createUi from './ui'
import ErrorMessage from '../../../ErrorMessage'

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
          series,
        },
        isVoid: true,
      }
    },
    toMdast: (object) => {
      // omit series
      const { identifier, series: _, ...data } = object.data
      return {
        type: 'zone',
        identifier,
        data: data,
        children: [],
      }
    },
  }

  const newBlock = (context, nodeData = {}) =>
    Block.fromJSON(
      zone.fromMdast(
        {
          type: 'zone',
          identifier: 'SERIES_NAV',
          data: nodeData,
        },
        0,
        undefined,
        {
          context,
        },
      ),
    )

  const serializer = new MarkdownSerializer({
    rules: [zone],
  })

  const SeriesNav = rule.component

  return {
    TYPE,
    helpers: {
      serializer,
      newBlock,
    },
    changes: {},
    ui: createUi({ TYPE, newBlock, zone }),
    plugins: [
      {
        renderNode({ node, editor, editor: { value }, attributes }) {
          if (!zone.match(node)) return

          const titleNode = value.document.findDescendant(
            (node) => node.type === 'TITLE',
          )
          return (
            <div {...attributes}>
              {titleNode && titleNode.data.get('series')?.episodes ? (
                <SeriesNav
                  repoId={titleNode.data.get('repoId')}
                  series={titleNode.data.get('series')}
                  inline={!node.data.get('grid')}
                  Link={DefaultLink}
                />
              ) : (
                <ErrorMessage error='Serien Episoden Daten fehlen. Bitte commiten.' />
              )}
            </div>
          )
        },
        schema: {
          [TYPE]: {
            isVoid: true,
          },
        },
      },
    ],
  }
}

export default SeriesNavPlugin
