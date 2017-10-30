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

export default ({TYPE, newBlock}) => {
  const SpecialButton = createActionButton({
    isDisabled: ({ state }) => {
      return state.isBlurred
    },
    reducer: ({ state, onChange }) => event => {
      event.preventDefault()

      return onChange(
        state
          .change()
          .call(
            injectBlock,
            newBlock()
          )
      )
    }
  })(
    ({ disabled, visible, ...props }) =>
      <span
        {...buttonStyles.insert}
        {...props}
        data-disabled={disabled}
        data-visible={visible}
        >
        Special
      </span>
  )

  const Form = ({ disabled, state, onChange }) => {
    if (disabled) {
      return null
    }
    return <div>
      <Label>Special</Label>
      {
        state.blocks
          .filter(matchBlock(TYPE))
          .map((node, i) => {
            const onInputChange = key => (_, value) => {
              onChange(
                state
                  .change()
                  .setNodeByKey(node.key, {
                    data: value
                      ? node.data.set(key, value)
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
          })
      }
    </div>
  }

  const SpecialForm = createPropertyForm({
    isDisabled: ({ state }) => {
      return !state.blocks.some(matchBlock(TYPE))
    }
  })(Form)

  return {
    forms: [SpecialForm],
    insertButtons: [SpecialButton]
  }
}
