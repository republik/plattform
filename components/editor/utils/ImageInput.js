import React from 'react'
import { css } from 'glamor'
import { Label } from '@project-r/styleguide'
import withT from '../../../lib/withT'

const styles = {
  label: css({
    display: 'block',
    marginBottom: 5
  }),
  input: css({
    display: 'none'
  })
}

const readImage = (onChange, t) => e => {
  const files = e.target.files

  if (files.length < 1) {
    return
  }
  const file = files[0]

  const [type, format] = file.type.split('/')
  if (type !== 'image') {
    window.alert(t('image/upload/notImage'))
    return
  }

  const sizeInMb = file.size / 1000 / 1000
  const jpegMb = 7.9
  const restMb = 1.5
  if (
    (format === 'jpeg' && sizeInMb > jpegMb) ||
    (format !== 'jpeg' && sizeInMb > restMb)
  ) {
    if (
      !window.confirm(
        t('image/upload/excessiveSize', {
          sizeInMb: Math.round(sizeInMb * 10) / 10,
          jpegMb,
          restMb,
          format: format.toUpperCase()
        })
      )
    ) {
      return
    }
  }

  const reader = new window.FileReader()
  reader.addEventListener('load', () => onChange(e, reader.result))
  reader.readAsDataURL(file)
}

const ImageInput = ({ onChange, t, src, label, maxWidth = 200 }) => (
  <label>
    <Label {...styles.label}>{label}</Label>
    <img
      src={src || '/static/placeholder.png'}
      style={{
        maxWidth,
        width: src ? undefined : '100%'
      }}
      alt=''
    />
    <input
      type='file'
      accept='image/jpeg,image/png,image/gif,image/svg+xml'
      {...styles.input}
      onChange={readImage(onChange, t)}
    />
  </label>
)

export default withT(ImageInput)
