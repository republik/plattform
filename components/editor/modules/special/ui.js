import React from 'react'
import { css } from 'glamor'

import styles from '../../styles'
import { Label } from '@project-r/styleguide'
import { Map } from 'immutable'

import {
  matchBlock,
  createPropertyForm,
  createActionButton
} from '../../utils'
import injectBlock from '../../utils/injectBlock'
import MetaForm from '../../utils/MetaForm'

import { CUSTOM } from './constants'
import { newBlock } from './'

export const SpecialButton = createActionButton({
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
      {...css(styles.insertButton)}
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
        .filter(matchBlock(CUSTOM))
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

export const SpecialForm = createPropertyForm({
  isDisabled: ({ state }) => {
    return !state.blocks.some(matchBlock(CUSTOM))
  }
})(Form)
