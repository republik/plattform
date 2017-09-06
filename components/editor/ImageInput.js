import React from 'react'
import { css } from 'glamor'
import { Label } from '@project-r/styleguide'

const styles = {
  label: css({
    display: 'block',
    marginBottom: 5
  }),
  placeholder: css({
    display: 'inline-block',
    backgroundColor: '#ccc'
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
    {src
      ? <img src={src} style={{maxWidth}} alt='' />
      : <span {...styles.placeholder} style={{width: maxWidth, height: maxWidth / 1.9}} />
    }
    <input
      type='file'
      {...styles.input}
      onChange={readImage(onChange)}
    />
  </label>
)

export default ImageInput
