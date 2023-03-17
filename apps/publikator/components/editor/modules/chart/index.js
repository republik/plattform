import { useContext } from 'react'
import MarkdownSerializer from 'slate-mdast-serializer'
import { Block } from 'slate'

import createUi from './ui'
import { matchBlock } from '../../utils'
import { createRemoveEmptyKeyHandler } from '../../utils/keyHandlers'
import InlineUI, { MarkButton } from '../../utils/InlineUI'
import { IconEdit } from '@republik/icons'
import { matchSubmodules } from '../../utils/matchers'
import {
  OverlayFormContext,
  OverlayFormContextProvider,
} from '../../utils/OverlayFormContext'

const CustomUi = ({ editor, node, TYPE, subModules }) => {
  const { setShowModal } = useContext(OverlayFormContext)
  return (
    <InlineUI
      node={node}
      editor={editor}
      isMatch={(value) => value.blocks.some(matchSubmodules(TYPE, subModules))}
    >
      <MarkButton onMouseDown={() => setShowModal(true)}>
        <IconEdit size={20} />
      </MarkButton>
    </InlineUI>
  )
}

export default ({ rule, subModules, TYPE }) => {
  const canvasModule = subModules.find((m) => m.name === 'chartCanvas')
  if (!canvasModule) {
    throw new Error('Missing chartCanvas submodule')
  }

  const CANVAS_TYPE = canvasModule.TYPE

  const childSerializer = new MarkdownSerializer({
    rules: subModules
      .reduce(
        (a, m) =>
          a.concat(
            m.helpers && m.helpers.serializer && m.helpers.serializer.rules,
          ),
        [],
      )
      .filter(Boolean),
  })

  const Container = rule.component

  const serializerRule = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, rest) => {
      return {
        kind: 'block',
        type: TYPE,
        data: node.data,
        nodes: childSerializer.fromMdast(node.children, 0, node, rest),
      }
    },
    toMdast: (object, index, parent, rest) => {
      const canvas = object.nodes.find(matchBlock(CANVAS_TYPE))

      return {
        type: 'zone',
        identifier: 'CHART',
        data: canvas.data.config,
        children: childSerializer.toMdast(object.nodes, 0, object, rest),
      }
    },
  }
  const serializer = new MarkdownSerializer({
    rules: [serializerRule],
  })

  const newBlock = () =>
    Block.create({
      type: TYPE,
      nodes: subModules.map((m) =>
        Block.create({
          type: m.TYPE,
          data:
            m.TYPE === CANVAS_TYPE
              ? {
                  isNew: true,
                  config: {},
                  values: '',
                }
              : undefined,
        }),
      ),
    })

  const isEmpty = (node) => !node.text.trim()

  return {
    TYPE,
    helpers: {
      serializer,
      newBlock,
    },
    ui: createUi({
      TYPE,
      CANVAS_TYPE,
      newBlock,
      editorOptions: rule.editorOptions,
    }),
    plugins: [
      {
        renderNode({ editor, node, children, attributes }) {
          if (!serializerRule.match(node)) return
          return (
            <OverlayFormContextProvider>
              <Container size={node.data.get('size')} attributes={attributes}>
                <CustomUi
                  node={node}
                  editor={editor}
                  TYPE={TYPE}
                  subModules={subModules}
                />
                {children}
              </Container>
            </OverlayFormContextProvider>
          )
        },
        onKeyDown: createRemoveEmptyKeyHandler({ TYPE, isEmpty }),
        schema: {
          blocks: {
            [TYPE]: {
              nodes: subModules.map((m) => ({
                kinds: ['block'],
                types: [m.TYPE],
                min: 1,
                max: 1,
              })),
              normalize: (change, reason, { node, index, child }) => {
                if (
                  reason === 'child_required' ||
                  (reason === 'child_type_invalid' &&
                    subModules.find((m) => m.TYPE === child.type) &&
                    node.nodes.filter(matchBlock(child.type)).size === 1)
                ) {
                  change.insertNodeByKey(node.key, index, {
                    kind: 'block',
                    type: subModules[index].TYPE,
                  })
                }
                if (reason === 'child_unknown') {
                  change.unwrapNodeByKey(child.key)
                }
              },
            },
          },
        },
      },
    ],
  }
}
