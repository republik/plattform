import { useContext } from 'react'
import { Block } from 'slate'

import { matchBlock } from '../../utils'
import MarkdownSerializer from '@republik/slate-mdast-serializer'

import createUi from './ui'

import EditOverlay from './EditOverlay'

import InlineUI, { MarkButton } from '../../utils/InlineUI'
import { IconEdit as MdEdit } from '@republik/icons'
import {
  OverlayFormContext,
  OverlayFormContextProvider,
} from '../../utils/OverlayFormContext'

const CustomUi = ({ editor, node, TYPE }) => {
  const { setShowModal } = useContext(OverlayFormContext)
  return (
    <InlineUI
      node={node}
      editor={editor}
      isMatch={(value) => value.blocks.some(matchBlock(TYPE))}
    >
      <MarkButton onMouseDown={() => setShowModal(true)}>
        <MdEdit size={20} />
      </MarkButton>
    </InlineUI>
  )
}

const EmbedDatawrapper = ({ rule, TYPE }) => {
  const { identifier = 'EMBEDDATAWRAPPER', resizable } = rule.editorOptions || {}

  const mdastRule = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node) => ({
      kind: 'block',
      type: TYPE,
      data: node.data,
      isVoid: true,
      nodes: [],
    }),
    toMdast: (object) => {
      return {
        type: 'zone',
        identifier,
        data: object.data,
        children: []
      }
    },
  }

  const serializer = new MarkdownSerializer({
    rules: [mdastRule],
  })

  const Component = rule.component

  const newItem = () =>
    Block.create({
      type: TYPE,
      isVoid: true,
      data: {
        plain: !resizable,
      }
    })

  return {
    TYPE,
    helpers: {
      serializer,
      newItem,
    },
    changes: {},
    ui: createUi({
      TYPE,
      newItem,
      editorOptions: rule.editorOptions,
    }),
    plugins: [
      {
        renderNode(props) {
          const { node, editor } = props
          if (node.type !== TYPE) return
          const data = node.data.toJS()
          const component = (
            <Component {...data} />
          )
          return (
            <OverlayFormContextProvider>
              <div style={{ position: 'relative' }}>
                <CustomUi node={node} editor={editor} TYPE={TYPE} />
                <EditOverlay
                  {...props}
                  component={component}
                  resizable={resizable}
                />
              </div>
            </OverlayFormContextProvider>
          )
        },
        schema: {
          blocks: {
            [TYPE]: {
              isVoid: true,
            },
          },
        },
      },
    ],
  }
}
export default EmbedDatawrapper
