import React from 'react'
import { Block } from 'slate'
import { css } from 'glamor'
import { Map } from 'immutable'

import { Radio, Label } from '@project-r/styleguide'

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
        .filter((block, index, all) => all.indexOf(block) === index)
        .map((block, i) => {
          const imageBlock = block.nodes.find(n => n.type === FIGURE_IMAGE)
          const captionBlock = block.nodes.find(n => n.type === FIGURE_CAPTION)
          const onInputChange = subject => key => (_, value) => {
            onChange(
              state
                .transform()
                .setNodeByKey(subject.key, {
                  data: value
                    ? subject.data.set(key, value)
                    : subject.data.remove(key)
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
                onInputChange={onInputChange(imageBlock)}
              />
              <MetaForm
                data={Map({
                  captionRight: captionBlock.data.get('captionRight') || false
                })}
                onInputChange={onInputChange(captionBlock)}
              />
              <p style={{margin: '10px 0'}}>
                <Label>Ausrichtung</Label><br />
                <Radio
                  value='left'
                  checked={!block.data.get('float')}
                  onChange={event => {
                    event.preventDefault()
                    onInputChange(block)('float')(
                      event,
                      undefined
                    )
                  }}>
                  Gross
                </Radio><br />
                <Radio
                  value='left'
                  checked={block.data.get('float') === 'left'}
                  onChange={event => {
                    event.preventDefault()
                    onInputChange(block)('float')(
                      event,
                      'left'
                    )
                  }}>
                  Links
                </Radio><br />
                <Radio
                  value='right'
                  checked={block.data.get('float') === 'right'}
                  onChange={event => {
                    event.preventDefault()
                    onInputChange(block)('float')(
                      event,
                      'right'
                    )
                  }}>
                  Rechts
                </Radio>
              </p>
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
