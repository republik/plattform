import React, { ChangeEvent } from 'react'
import { css } from 'glamor'
import { IconClose } from '@republik/icons'

const styles = {
  label: css({
    display: 'block',
    marginBottom: 5,
  }),
  input: css({
    display: 'none',
  }),
  close: css({
    position: 'absolute',
    background: 'rgba(255, 255, 255, 0.5)',
    right: 7,
    marginTop: 7,
    cursor: 'pointer',
  }),
}

const readImage =
  (onChange: (src: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (files.length < 1) {
      return
    }
    const file = files[0]

    const [type, format] = file.type.split('/')
    if (type !== 'image') {
      window.alert('not an image')
      return
    }

    const sizeInMb = file.size / 1000 / 1000
    const jpegMb = 7.9
    const restMb = 1.5
    if (
      (format === 'jpeg' && sizeInMb > jpegMb) ||
      (format !== 'jpeg' && sizeInMb > restMb)
    ) {
      if (!window.confirm('you sure this big?')) {
        return
      }
    }

    const reader = new window.FileReader()
    reader.addEventListener('load', () => onChange(reader.result as string))
    reader.readAsDataURL(file)
  }

const ImageInput: React.FC<{
  src?: string
  onChange: (src: string) => void
}> = ({ src, onChange }) => (
  <div
    style={{ position: 'relative', userSelect: 'none' }}
    contentEditable={false}
  >
    <label>
      {src && (
        <IconClose
          {...styles.close}
          onClick={(e) => {
            e.preventDefault()
            onChange(undefined)
          }}
        />
      )}
      <img
        src={src || '/static/placeholder.png'}
        style={{
          objectFit: 'cover',
          width: '100%',
          backgroundColor: '#fff',
        }}
        alt=''
      />
      <input
        type='file'
        accept='image/jpeg,image/png,image/gif,image/svg+xml'
        {...styles.input}
        onChange={readImage(onChange)}
      />
    </label>
  </div>
)

export default ImageInput
