import { Label } from '@project-r/styleguide'
import { IconTag as InsertVarIcon } from '@republik/icons'
import { Map } from 'immutable'
import { Inline } from 'slate'
import withT from '../../../../lib/withT'

import {
  buttonStyles,
  createInlineButton,
  matchBlock,
  matchInline,
} from '../../utils'

import injectBlock from '../../utils/injectBlock'

import MetaForm from '../../utils/MetaForm'
import { greetingMdast, hasAccessMdast } from './mdastTemplates'

const blockFactories = {
  greeting: ({ context }) => {
    return context.rootSerializer
      .deserialize(greetingMdast)
      .document.nodes.first()
      .nodes.first()
  },
  hasAccess: ({ context }) => {
    return context.rootSerializer
      .deserialize(hasAccessMdast)
      .document.nodes.first()
      .nodes.first()
  },
}

const createForm = (options) =>
  withT(({ t, value, onChange, repoId }) => {
    const { TYPE, editorOptions } = options

    const matchInlineType = matchInline(TYPE)
    const matchBlockType = matchBlock(TYPE)

    const nodes = value.inlines
      .filter(matchInlineType)
      .concat(
        value.blocks
          .map((node) => value.document.getFurthest(node.key, matchBlockType))
          .filter(Boolean),
      )

    if (!nodes.size) {
      return null
    }

    const onInputChange = (node) => (key) => (_, inputValue) => {
      onChange(
        value.change().setNodeByKey(node.key, {
          data: inputValue
            ? node.data.set(key, inputValue)
            : node.data.remove(key),
        }),
      )
    }

    return (
      <div>
        <Label>{t(`variable/form/${TYPE}`, undefined, TYPE)}</Label>
        {nodes.map((node) => (
          <MetaForm
            key={node.key}
            data={Map(
              editorOptions.fields.map((field) => [field.key, '']),
            ).merge(node.data)}
            onInputChange={onInputChange(node)}
            customFields={editorOptions.fields}
            repoId={repoId}
          />
        ))}
      </div>
    )
  })

const createUI = ({ TYPE, editorOptions, context }) => {
  const { insertBlocks = [], insertVar } = editorOptions

  const From = editorOptions.fields && createForm({ TYPE, editorOptions })
  const insertTypes = editorOptions.insertTypes || []

  const insertButtons = insertBlocks
    .map((insertBlock) => {
      const newBlock = blockFactories[insertBlock]
      return (
        newBlock &&
        withT(({ t, value, onChange }) => {
          const disabled =
            value.isBlurred ||
            !value.blocks.every((n) => insertTypes.includes(n.type))

          return (
            <span
              {...buttonStyles.insert}
              data-disabled={disabled}
              data-visible
              onMouseDown={(event) => {
                event.preventDefault()
                if (!disabled) {
                  const change = value.change()
                  change.call(injectBlock, newBlock({ context }))
                  return onChange(change)
                }
              }}
            >
              {t(`variable/insert/${insertBlock}`, undefined, insertBlock)}
            </span>
          )
        })
      )
    })
    .filter(Boolean)

  const textButton =
    insertVar &&
    createInlineButton({
      type: TYPE,
      parentTypes: insertTypes,
      isDisabled: ({ value }) => value.isExpanded,
      reducer: (props) => (event) => {
        event.preventDefault()
        const { onChange, value } = props

        return onChange(
          value.change().insertInline(
            Inline.create({
              type: TYPE,
              data: editorOptions.fields?.reduce((data, field) => {
                if (field.items) {
                  data[field.key] = field.items[0].value
                }
                return data
              }, {}),
            }),
          ),
        )
      },
    })(({ active, disabled, visible, ...props }) => (
      <span
        {...buttonStyles.mark}
        {...props}
        data-active={active}
        data-disabled={disabled}
        data-visible={visible}
      >
        <InsertVarIcon size={24} />
      </span>
    ))

  return {
    forms: [From],
    insertButtons,
    textFormatButtons: [textButton],
  }
}

export default createUI
