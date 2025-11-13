import { useState } from 'react'
import { css } from 'glamor'
import { Label, Spinner } from '@project-r/styleguide'
import withT from '../../../lib/withT'
import { IconClose as MdClose } from '@republik/icons'
import { useImageUpload } from '../../../lib/hooks/useImageUpload'

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
  uploading: css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 4,
  }),
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
  repoId,
}) => {
  const { uploadImage, uploading, progress, error } = useImageUpload(repoId)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleFileChange = async (e) => {
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
    const maxMb = 10
    if (sizeInMb > maxMb) {
      window.alert(
        t(
          'image/upload/tooLarge',
          { maxMb },
          `Image must be smaller than ${maxMb} MB`,
        ),
      )
      return
    }

    // Create a preview URL for immediate feedback
    const reader = new window.FileReader()
    reader.addEventListener('load', () => {
      setPreviewUrl(reader.result)
    })
    reader.readAsDataURL(file)

    try {
      // Upload to S3 and get repo-file:// reference
      const fileReference = await uploadImage(file)
      onChange(e, fileReference)
    } catch (err) {
      window.alert(
        t(
          'image/upload/error',
          { error: err.message },
          `Upload failed: ${err.message}`,
        ),
      )
      setPreviewUrl(null)
    }
  }

  const displaySrc = previewUrl || src

  return (
    <div style={{ position: 'relative' }}>
      <label>
        <Label {...styles.label}>{label}</Label>
        {displaySrc && (
          <MdClose
            {...styles.close}
            onClick={(e) => {
              e.preventDefault()
              setPreviewUrl(null)
              onChange(e, undefined)
            }}
          />
        )}
        <img
          src={displaySrc || placeholder || '/static/placeholder.png'}
          {...imageStyles}
          style={{
            maxWidth,
            maxHeight,
            objectFit: 'cover',
            objectPosition: 'center',
            width: width || (displaySrc ? undefined : '100%'),
            height,
            backgroundColor: dark ? '#1F1F1F' : '#fff',
            opacity: uploading ? 0.5 : 1,
          }}
          alt=''
        />
        {uploading && (
          <div {...styles.uploading}>
            <Spinner size={24} />
            <div style={{ marginTop: 8, fontSize: 12 }}>{progress}%</div>
          </div>
        )}
        <input
          type='file'
          accept='image/jpeg,image/png,image/gif,image/svg+xml'
          {...styles.input}
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>
      {error && (
        <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{error}</div>
      )}
    </div>
  )
}

export default withT(ImageInput)
