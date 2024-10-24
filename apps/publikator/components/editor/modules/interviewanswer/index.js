import { buttonStyles, matchBlock } from "../../utils";
import MarkdownSerializer from '@republik/slate-mdast-serializer'
import {
  Label,
} from '@project-r/styleguide'
import { Block } from "slate";
import injectBlock from "../../utils/injectBlock";

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

  const center = {
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
    rules: [center],
  })

  const buttonClickHandler = (value, onChange) => (event) => {
    event.preventDefault()

    return onChange(
      value.change().call(
        injectBlock,
        Block.create({
          type: TYPE,
          nodes: [
            Block.create(paragraphModule.TYPE),
          ],
        }),
      ),
    )
  }

  const { insertButtonText, insertTypes = [] } = editorOptions || {}
  const Button = ({ value, onChange }) => {
    const disabled =
      value.isBlurred ||
      !value.blocks.every((n) => insertTypes.includes(n.type))
    return (
      <span
        {...buttonStyles.insert}
        data-disabled={disabled}
        data-visible
        onMouseDown={buttonClickHandler(value, onChange)}
      >
        {insertButtonText}
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
    ui: {
      insertButtons: [Button],
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
        schema: {
          blocks: {
            [TYPE]: {
              nodes: [
                {
                  types: [paragraphModule.TYPE],
                  min: 1,
                },
              ],
            },
          },
        },
      },
    ],
  }
}
