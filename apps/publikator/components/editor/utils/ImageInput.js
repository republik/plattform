import { Label, Spinner } from '@project-r/styleguide'
import { IconClose as MdClose } from '@republik/icons'
import { css } from 'glamor'
import { getRepoIdFromQuery } from 'lib/repoIdHelper'
import { useRouter } from 'next/router'
import { useState, useTransition } from 'react'
import withT from '../../../lib/withT'
import ErrorMessage from '../../ErrorMessage'

const styles = {
  label: css({
    display: 'block',
    marginBottom: 5,
    position: 'relative',
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
  spinner: css({
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeContent: 'center',
  }),
}

async function getImageData(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result

      const image = new Image()
      image.onload = (e) => {
        resolve({
          dataURL: result,
          width: e.target.width,
          height: e.target.height,
        })
      }
      image.src = result
    }
    reader.readAsDataURL(file)
  })
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
}) => {
  const { query } = useRouter()
  const repoId = getRepoIdFromQuery(query)
  const [error, setError] = useState(null)

  const [isPending, startTransition] = useTransition()

  const handleImageUpload = (event) => {
    setError(null)
    const file = event.target.files?.[0]
    if (!file) return

    startTransition(async () => {
      try {
        // Show preview immediately
        const { width, height } = await getImageData(file)

        // Get upload URL
        const uploadUrlRes = await fetch('/api/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: file.name,
            path: `repos/${repoId}/images`,
            contentType: file.type,
          }),
        })

        // Upload the image
        if (uploadUrlRes.ok) {
          const { url, fields } = await uploadUrlRes.json()

          const formData = new FormData()
          Object.entries(fields).forEach(([key, value]) => {
            formData.append(key, value)
          })
          formData.append('file', file)

          const uploadRes = await fetch(url, {
            method: 'POST',
            body: formData,
          })

          // Upload succeeded
          if (uploadRes.ok) {
            const finalUrl = new URL(
              fields.key,
              process.env.NEXT_PUBLIC_S3_ASSETS_BASE_URL.replace(/\/?$/, '/'),
            )
            // Append original image dimensions
            finalUrl.searchParams.set('size', `${width}x${height}`)
            onChange(event, finalUrl.toString())
          } else {
            console.error('Upload Error:', uploadRes)
            setError(uploadRes.statusText)
          }
        } else {
          console.error('Failed to get pre-signed URL.', uploadUrlRes)
          setError(uploadUrlRes.statusText)
        }
      } catch (error) {
        setError(error.message)
        console.error(error)
      }
    })
  }

  return (
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
            width: width || '100%',
            height,
            backgroundColor: dark ? '#1F1F1F' : '#fff',
          }}
          alt=''
        />
        <input
          type='file'
          accept='image/jpeg,image/png,image/gif,image/svg+xml'
          {...styles.input}
          onChange={handleImageUpload}
          disabled={isPending}
        />
        {isPending && (
          <div {...styles.spinner}>
            <Spinner />
          </div>
        )}
        {error && (
          <div {...styles.spinner}>
            <ErrorMessage error={error} />
          </div>
        )}
      </label>
    </div>
  )
}

export default withT(ImageInput)
