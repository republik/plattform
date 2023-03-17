import { cloneElement, useContext } from 'react'
import { Block } from 'slate'

import { matchBlock } from '../../utils'
import MarkdownSerializer from 'slate-mdast-serializer'

import createUi from './ui'

import EditOverlay from './EditOverlay'

import dynamicComponentRequire from './require'
import dynamicComponentIdentifiers from './identifiers'
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

const DynamicComponent = ({ rule, subModules, TYPE }) => {
  const { identifier = 'DYNAMIC_COMPONENT' } = rule.editorOptions || {}

  const mdastRule = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node) => {
      const html = node.children.find(
        (c) => c.type === 'code' && c.lang === 'html',
      )

      return {
        kind: 'block',
        type: TYPE,
        data: {
          ...node.data,
          html: html ? html.value : '',
        },
        isVoid: true,
        nodes: [],
      }
    },
    toMdast: (object) => {
      const { html, ...data } = object.data
      return {
        type: 'zone',
        identifier,
        data,
        children: html
          ? [
              {
                type: 'code',
                lang: 'html',
                value: html,
              },
            ]
          : [],
      }
    },
  }

  const serializer = new MarkdownSerializer({
    rules: [mdastRule],
  })

  const DynamicComponent = rule.component

  const newItem = () =>
    Block.create({
      type: TYPE,
      isVoid: true,
      data: {
        identifier: 'TK',
        autoHtml: false,
      },
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
            <DynamicComponent
              showException
              key={JSON.stringify(data)}
              require={dynamicComponentRequire}
              identifiers={dynamicComponentIdentifiers}
              {...data}
            />
          )
          const preview = cloneElement(component, {
            raw: true,
          })

          return (
            <OverlayFormContextProvider>
              <div style={{ position: 'relative' }}>
                <CustomUi node={node} editor={editor} TYPE={TYPE} />
                <EditOverlay
                  {...props}
                  component={component}
                  preview={preview}
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
export default DynamicComponent
