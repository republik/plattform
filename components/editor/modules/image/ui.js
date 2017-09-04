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

export const Thumbnail = ({ src }) =>
  <span style={{
    display: 'inline-block',
    width: '35px',
    height: '25px',
    backgroundImage: src ? `url("${src}")` : 'none',
    backgroundSize: 'cover',
    backgroundColor: colors.disabled
  }}
  />

const fileChangeHandler = (node, state, onChange) => e => {
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
          .setNodeByKey(node.key, {
            data: node.data.set('src', reader.result)
          })
          .apply()
    )
  )
  reader.readAsDataURL(file)
}

const altChangeHandler = (node, state, onChange) => event => {
  onChange(
    state
      .transform()
      .setNodeByKey(node.key, {
        data: node.data.set('alt', event.target.value)
      })
      .apply()
  )
}

export const ImagePropertyForm = ({ state, node, onChange }) =>
  <span style={{ display: 'block' }}>
    <label htmlFor={`image-props-src-${node.key}`}>
      <Thumbnail src={node.data.get('src')} />
      <input
        id={`image-props-src-${node.key}`}
        type='file'
        style={{display: 'none'}}
        onChange={fileChangeHandler(node, state, onChange)}
      />
    </label>
    <label htmlFor={`image-props-alt-${node.key}`}>
      Alt
      <input
        id={`image-props-alt-${node.key}`}
        style={{outline: 'none', border: 'none', borderBottom: '1px solid #ccc', width: '100%'}}
        type='text'
        value={node.data.get('alt') || ''}
        onChange={
          altChangeHandler(node, state, onChange)
        }
      />
    </label>
  </span>

export const ImageForm = createPropertyForm({
  isDisabled: ({ state }) => {
    return !state.blocks.some(matchBlock(IMAGE))
  }
})(({ disabled, state, onChange }) => {
  if (disabled) {
    return null
  }
  return <span>
    <Label><Caret />Images</Label>
    {
      state.blocks
        .filter(matchBlock(IMAGE))
        .map((block, i) => (
          <ImagePropertyForm
            key={`image-${i}`}
            state={state}
            node={block}
            onChange={onChange}
          />
        ))
    }
  </span>
})

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
  ({ disabled, visible, ...props }) =>
    <span
      {...{...css(styles.insertButton), ...props}}
      data-disabled={disabled}
      data-visible={visible}
      >
      Image
    </span>

)
