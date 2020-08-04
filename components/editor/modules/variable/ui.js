import React from 'react'
import { Map } from 'immutable'
import { parse } from '@orbiting/remark-preset'
import { Block, Inline } from 'slate'

import { Label } from '@project-r/styleguide'
import InsertVarIcon from 'react-icons/lib/fa/tag'

import MetaForm from '../../utils/MetaForm'
import withT from '../../../../lib/withT'

import injectBlock from '../../utils/injectBlock'

import {
  createPropertyForm,
  createInlineButton,
  buttonStyles,
  matchBlock,
  matchInline
} from '../../utils'

const blockFactories = {
  greeting: ({ context }) => {
    return context.rootSerializer
      .deserialize(
        parse(
          `
<section><h6>CENTER</h6>

<section><h6>IF</h6>

\`\`\`
{"present": "lastName"}
\`\`\`

Guten Tag <span data-variable="firstName"></span> <span data-variable="lastName"></span>

<section><h6>ELSE</h6>

Hallo, guten Tag

<hr /></section>

<hr /></section>

<hr /></section>
`.trim()
        )
      )
      .document.nodes.first()
      .nodes.first()
  }
}

const createForm = options =>
  withT(({ t, value, onChange }) => {
    const { TYPE, editorOptions } = options

    const matchInlineType = matchInline(TYPE)
    const matchBlockType = matchBlock(TYPE)

    const nodes = value.inlines
      .filter(matchInlineType)
      .concat(
        value.blocks
          .map(node => value.document.getFurthest(node.key, matchBlockType))
          .filter(Boolean)
      )

    if (!nodes.size) {
      return null
    }

    const onInputChange = node => key => (_, inputValue) => {
      onChange(
        value.change().setNodeByKey(node.key, {
          data: inputValue
            ? node.data.set(key, inputValue)
            : node.data.remove(key)
        })
      )
    }

    return (
      <div>
        <Label>{t(`variable/form/${TYPE}`, undefined, TYPE)}</Label>
        {nodes.map(node => (
          <MetaForm
            key={node.key}
            data={Map(editorOptions.fields.map(field => [field.key, ''])).merge(
              node.data
            )}
            onInputChange={onInputChange(node)}
            customFields={editorOptions.fields}
          />
        ))}
      </div>
    )
  })

const createUI = ({ TYPE, editorOptions, context }) => {
  const { insertBlock, insertVar } = editorOptions

  const From = editorOptions.fields && createForm({ TYPE, editorOptions })

  const newBlock = blockFactories[insertBlock]
  const insertTypes = editorOptions.insertTypes || []

  const InsertButton =
    newBlock &&
    withT(({ t, value, onChange }) => {
      const disabled =
        value.isBlurred ||
        !value.blocks.every(n => insertTypes.includes(n.type))

      return (
        <span
          {...buttonStyles.insert}
          data-disabled={disabled}
          data-visible
          onMouseDown={event => {
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

  const textButton =
    insertVar &&
    createInlineButton({
      type: TYPE,
      parentTypes: insertTypes,
      isDisabled: ({ value }) => value.isExpanded,
      reducer: props => event => {
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
              }, {})
            })
          )
        )
      }
    })(({ active, disabled, visible, ...props }) => (
      <span
        {...buttonStyles.mark}
        {...props}
        data-active={active}
        data-disabled={disabled}
        data-visible={visible}
      >
        <InsertVarIcon />
      </span>
    ))

  return {
    forms: [From],
    insertButtons: [InsertButton],
    textFormatButtons: [textButton]
  }
}

export default createUI
