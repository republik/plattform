import { css } from 'glamor'
import { Label } from '@project-r/styleguide'
import withT from '../../../lib/withT'
import {
  IconClose as MdClose
} from '@republik/icons'

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

const readImage = (onChange, t) => (e) => {
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
          format: format.toUpperCase(),
        }),
      )
    ) {
      return
    }
  }

  const reader = new window.FileReader()
  reader.addEventListener('load', () => onChange(e, reader.result))
  reader.readAsDataURL(file)
}

const ImageInput = ({
  onChange,
  t,
  src,
  dark,
  label,
  maxHeight,
  imageStyles,
  placeholder,
  maxWidth = 200,
  width,
  height,
}) => (
  <div style={{ position: 'relative' }}>
    <label>
      <Label {...styles.label}>{label}</Label>
      {src && (
        <MdClose
          {...styles.close}
          onClick={(e) => {
            e.preventDefault()
            onChange(e, undefined)
          }}
        />
      )}
      <img
        src={src || placeholder || '/static/placeholder.png'}
        {...imageStyles}
        style={{
          maxWidth,
          maxHeight,
          objectFit: 'cover',
          objectPosition: 'center',
          width: width || (src ? undefined : '100%'),
          height,
          backgroundColor: dark ? '#1F1F1F' : '#fff',
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
  </div>
)

export default withT(ImageInput)
