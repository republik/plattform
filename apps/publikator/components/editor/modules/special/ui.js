import React from 'react'

import { Label } from '@project-r/styleguide'
import { Map } from 'immutable'

import {
  matchBlock,
  createPropertyForm,
  createActionButton,
  buttonStyles
} from '../../utils'
import injectBlock from '../../utils/injectBlock'
import MetaForm from '../../utils/MetaForm'

export default ({ TYPE, newBlock, rule }) => {
  const SpecialButton = createActionButton({
    isDisabled: ({ value }) => {
      return value.isBlurred
    },
    reducer: ({ value, onChange }) => event => {
      event.preventDefault()

      return onChange(value.change().call(injectBlock, newBlock()))
    }
  })(({ disabled, visible, ...props }) => (
    <span
      {...buttonStyles.insert}
      {...props}
      data-disabled={disabled}
      data-visible={visible}
    >
      Special
    </span>
  ))

  const Form = ({ disabled, value, onChange }) => {
    if (disabled) {
      return null
    }
    return (
      <div>
        <Label>Special</Label>
        {value.blocks.filter(matchBlock(TYPE)).map((node, i) => {
          const onInputChange = key => (_, inputValue) => {
            onChange(
              value.change().setNodeByKey(node.key, {
                data: inputValue
                  ? node.data.set(key, inputValue)
                  : node.data.remove(key)
              })
            )
          }
          return (
            <MetaForm
              key={`special-${i}`}
              data={Map({
                identifier: ''
              }).merge(node.data)}
              onInputChange={onInputChange}
            />
          )
        })}
      </div>
    )
  }

  const SpecialForm = createPropertyForm({
    isDisabled: ({ value }) => {
      return !value.blocks.some(matchBlock(TYPE))
    }
  })(Form)

  return {
    forms: [SpecialForm],
    insertButtons: [SpecialButton]
  }
}
