import { buttonStyles, matchBlock } from "../../utils";
import MarkdownSerializer from '@republik/slate-mdast-serializer'
import {
  Label,
} from '@project-r/styleguide'
import { matchSubmodules } from "../../utils/matchers";
import { createRemoveEmptyKeyHandler } from "../../utils/keyHandlers";

export default ({ rule, subModules, TYPE }) => {
  const editorOptions = rule.editorOptions || {}

  const paragraphModule = subModules.find((m) => m.name === 'paragraph')
  if (!paragraphModule) {
    throw new Error('Missing paragraph submodule')
  }

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

  const interviewRule = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, rest) => ({
      kind: 'block',
      type: TYPE,
      nodes: childSerializer.fromMdast(node.children, 0, node, rest),
    }),
    toMdast: (object, index, parent, rest) => ({
      type: 'zone',
      identifier: TYPE,
      children: childSerializer.toMdast(object.nodes, 0, object, rest),
    }),
  }

  const serializer = new MarkdownSerializer({
    rules: [interviewRule],
  })

  const buttonClickHandler = (value, onChange) => (event) => {
    event.preventDefault()
    const isBlock = value.blocks.some(matchSubmodules(TYPE, subModules))

    return onChange(isBlock ?
      value.change().unwrapBlock({ normalize: false}).setBlock('PARAGRAPH') :
      value.change().setBlock('INTERVIEWANSWERP', { normalize: false }).wrapBlock(TYPE))
  }

  const { formatButtonText } = editorOptions || {}
  const Button = ({ value, onChange }) => {
    const disabled = value.isBlurred
    return (
      <span
        {...buttonStyles.insert}
        data-disabled={disabled}
        data-visible
        onMouseDown={buttonClickHandler(value, onChange)}
      >
        {formatButtonText}
      </span>
    )
  }

  return {
    TYPE,
    helpers: {
      serializer,
      childSerializer,
    },
    changes: {},
    rule: interviewRule,
    ui: {
      blockFormatButtons: [Button],
    },
    plugins: [
      {
        renderNode({ node, children, attributes }) {
          if (!matchBlock(TYPE)(node)) {
            return
          }

          return <div attributes={attributes} style={{ position: 'relative' }}>
            <div contentEditable={false} style={{
              backgroundColor: 'rgba(100,100,100,0.2)',
              width: 3,
              top: -2,
              bottom: -2,
              position: 'absolute',
              left: -10 }} />
            <span  contentEditable={false} style={{
              backgroundColor: 'rgba(100,100,100,0.2)',
              borderRadius: 2,
              position: 'absolute',
              left: -94,
              top: 2,
              padding: 2
            }}>
              <Label style={{ padding: '0 5px' }}>Stimme 2</Label>
            </span>
            {children}
          </div>
        },
        onKeyDown: createRemoveEmptyKeyHandler({ TYPE, isEmpty: (node) => !node.text.trim(), }),
        schema: {
          blocks: {
            [TYPE]: {
              nodes: [
                {
                  types: [paragraphModule.TYPE],
                  min: 1,
                  max: 1,
                },
              ],
            },
          },
        },
      },
    ],
  }
}
