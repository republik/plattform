/* global FileReader */
import React from 'react'
import { Block } from 'slate'
import { colors, Label } from '@project-r/styleguide'
import { css } from 'glamor'
import Caret from 'react-icons/lib/fa/caret-right'
import {
  matchBlock,
  createPropertyForm,
  createActionButton
} from '../../utils'
import styles from '../../styles'
import { IMAGE } from './constants'

const Thumbnail = ({ src }) =>
  <span style={{
    display: 'inline-block',
    width: '35px',
    height: '25px',
    backgroundImage: src ? `url("${src}")` : 'none',
    backgroundSize: 'cover',
    backgroundColor: colors.disabled
  }}
  />

const fileChangeHandler = (block, state, onChange) => e => {
  const files = e.target.files

  if (files.length < 1) {
    return
  }
  const file = files[0]

  const reader = new FileReader()
  const [ type ] = file.type.split('/')
  if (type !== 'image') {
    return
  }

  reader.addEventListener(
    'load',
    () => onChange(
        state
          .transform()
          .setNodeByKey(
            block.key,
          {
            data: {
              alt: block.data.get('alt'),
              src: reader.result
            }
          }
          )
          .apply()
    )
  )
  reader.readAsDataURL(file)
}

const altChangeHandler = (block, state, onChange) => event => {
  onChange(
    state
      .transform()
      .setNodeByKey(block.key, {
        data: {
          src: block.data.get('src'),
          alt: event.target.value
        }
      })
      .apply()
  )
}

const Form = ({ disabled, state, onChange }) => {
  if (disabled) {
    return null
  }
  return <span>
    <Label><Caret />Images</Label>
    {
      state.blocks
        .filter(matchBlock(IMAGE))
        .map((block, i) => (
          <span key={`image-${i}`} style={{ display: 'block' }}>
            <label htmlFor={`image-input-${block.key}`}>
              <Thumbnail src={block.data.get('src')} />
              <input
                id={`image-input-${block.key}`}
                type='file'
                style={{display: 'none'}}
                onChange={fileChangeHandler(block, state, onChange)}
            />
            </label>
            <input
              style={{outline: 'none', border: 'none', borderBottom: '1px solid #ccc'}}
              type='text'
              value={block.data.get('alt') || ''}
              onChange={
                altChangeHandler(block, state, onChange)
              }
              />
          </span>
        ))
    }
  </span>
}

export const ImageForm = createPropertyForm({
  isDisabled: ({ state }) => {
    return !state.blocks.some(matchBlock(IMAGE))
  }
})(Form)

export const ImageButton = createActionButton({
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
            type: IMAGE,
            isVoid: true
          })
        )
        .apply()
    )
  }
})(
  ({ disabled, ...props }) =>
    <span
      {...{...css(styles.insertButton), ...props}}
      data-disabled={disabled}
      >
      Image
    </span>

)
