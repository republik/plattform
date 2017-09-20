import React from 'react'
import { css } from 'glamor'
import { Label } from '@project-r/styleguide'
import { gray2x1 } from './placeholder'

const styles = {
  label: css({
    display: 'block',
    marginBottom: 5
  }),
  input: css({
    display: 'none'
  })
}

const readImage = onChange => e => {
  const files = e.target.files

  if (files.length < 1) {
    return
  }
  const file = files[0]

  const reader = new window.FileReader()
  const [ type ] = file.type.split('/')
  if (type !== 'image') {
    return
  }

  reader.addEventListener(
    'load',
    () => onChange(e, reader.result)
  )
  reader.readAsDataURL(file)
}

const ImageInput = ({onChange, src, label, maxWidth = 200}) => (
  <label>
    <Label {...styles.label}>
      {label}
    </Label>
    <img
      src={src || gray2x1}
      style={{
        maxWidth,
        width: src ? undefined : '100%'
      }}
      alt='' />
    <input
      type='file'
      accept='image/*'
      {...styles.input}
      onChange={readImage(onChange)}
    />
  </label>
)

export default ImageInput
