import React from 'react'
import { Block } from 'slate'
import { Label } from '@project-r/styleguide'
import { css } from 'glamor'
import { Map } from 'immutable'

import {
  matchBlock,
  createPropertyForm,
  createActionButton
} from '../../utils'
import MetaForm from '../../utils/MetaForm'

import styles from '../../styles'
import { FIGURE, FIGURE_IMAGE } from './constants'

export const FigureForm = createPropertyForm({
  isDisabled: ({ state }) => {
    return !state.blocks.some(matchBlock(FIGURE_IMAGE))
  }
})(({ disabled, state, onChange }) => {
  if (disabled) {
    return null
  }
  return <div>
    <Label>Images</Label>
    {
      state.blocks
        .filter(matchBlock(FIGURE_IMAGE))
        .map((block, i) => {
          const onInputChange = key => (_, value) => {
            onChange(
              state
                .transform()
                .setNodeByKey(block.key, {
                  data: value
                    ? block.data.set(key, value)
                    : block.data.remove(key)
                })
                .apply()
            )
          }

          return (
            <MetaForm
              key={`figure-${i}`}
              data={Map({
                src: '',
                alt: ''
              }).merge(block.data)}
              onInputChange={onInputChange}
            />
          )
        })
    }
  </div>
})

export const FigureButton = createActionButton({
  isDisabled: ({ state }) => {
    return state.isBlurred
  },
  reducer: ({ state, onChange }) => event => {
    event.preventDefault()
    return onChange(
      state
        .transform()
        .insertBlock(
          Block.create({
            type: FIGURE
          })
        )
        .apply()
    )
  }
})(
  ({ disabled, visible, ...props }) =>
    <span
      {...{...css(styles.insertButton), ...props}}
      data-disabled={disabled}
      data-visible={visible}
      >
      Bild
    </span>

)
