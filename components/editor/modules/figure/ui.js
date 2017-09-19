import React from 'react'
import { Block } from 'slate'
import { css } from 'glamor'
import { Map } from 'immutable'

import {
  createPropertyForm,
  createActionButton
} from '../../utils'
import MetaForm from '../../utils/MetaForm'

import styles from '../../styles'
import { FIGURE, FIGURE_IMAGE, FIGURE_CAPTION } from './constants'

const isFigureBlock = block => block.type === FIGURE_IMAGE || block.type === FIGURE_CAPTION

export const FigureForm = createPropertyForm({
  isDisabled: ({ state }) => {
    return (
      !state.blocks.some(isFigureBlock)
    )
  }
})(({ disabled, state, onChange }) => {
  if (disabled) {
    return null
  }
  return <div>
    {
      state.blocks
        .filter(isFigureBlock)
        .map(block => block.type === 'FIGURE'
          ? block
          : state.document.getParent(block.key)
        )
        .map((block, i) => {
          const imageBlock = block.nodes.find(n => n.type === FIGURE_IMAGE)
          const onImage = key => (_, value) => {
            onChange(
              state
                .transform()
                .setNodeByKey(imageBlock.key, {
                  data: value
                    ? imageBlock.data.set(key, value)
                    : imageBlock.data.remove(key)
                })
                .apply()
            )
          }
          const captionBlock = block.nodes.find(n => n.type === FIGURE_CAPTION)
          const onCaption = key => (_, value) => {
            onChange(
              state
                .transform()
                .setNodeByKey(captionBlock.key, {
                  data: value
                    ? captionBlock.data.set(key, value)
                    : captionBlock.data.remove(key)
                })
                .apply()
            )
          }

          return (
            <div key={`figure-${i}`}>
              <MetaForm
                data={Map({
                  src: '',
                  alt: ''
                }).merge(imageBlock.data)}
                onInputChange={onImage}
              />
              <MetaForm
                data={Map({
                  captionRight: false
                }).merge(captionBlock.data)}
                onInputChange={onCaption}
              />
            </div>
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
