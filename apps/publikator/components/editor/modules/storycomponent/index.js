import { IconEdit as MdEdit } from '@republik/icons'
import MarkdownSerializer from '@republik/slate-mdast-serializer'
import { useContext } from 'react'
import { Block } from 'slate'

import { matchBlock } from '../../utils'

import InlineUI, { MarkButton } from '../../utils/InlineUI'
import {
  OverlayFormContext,
  OverlayFormContextProvider,
} from '../../utils/OverlayFormContext'

import EditOverlay from './EditOverlay'

import createUi from './ui'

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

const StoryComponent = ({ rule, TYPE }) => {
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
        identifier: TYPE,
        data: object.data,
        children: [],
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
          const component = <Component {...data} />
          return (
            <OverlayFormContextProvider>
              <div style={{ position: 'relative' }}>
                <CustomUi node={node} editor={editor} TYPE={TYPE} />
                <EditOverlay
                  key='story-overlay'
                  {...props}
                  component={component}
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
export default StoryComponent
