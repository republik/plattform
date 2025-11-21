import { useRef, useState } from 'react'
import { css } from 'glamor'
import { Label, Button, Spinner } from '@project-r/styleguide'
import { useImageUpload } from '../../../../lib/hooks/useImageUpload'

const styles = {
  label: css({
    display: 'block',
    marginBottom: 5,
  }),
  input: css({
    display: 'none',
  }),
}

const FilesInput = ({ onChange, repoId }) => {
  const inputRef = useRef(null)
  const { uploadImage } = useImageUpload(repoId)
  const [uploading, setUploading] = useState(false)

  const handleFiles = async (e) => {
    const files = [...e.target.files]

    if (files.length < 1) {
      return
    }

    const htmlFile = files.find((file) => file.type === 'text/html')
    const imageFiles = files.filter(
      (file) => file.type.split('/')[0] === 'image',
    )

    if (!htmlFile) {
      return
    }

    setUploading(true)

    try {
      // Read HTML file
      const code = await new Promise((resolve, reject) => {
        const reader = new window.FileReader()
        reader.addEventListener('load', () => resolve(reader.result))
        reader.addEventListener('error', (e) => reject(e))
        reader.readAsText(htmlFile)
      })

      // Upload images to S3 and get repo-file:// references
      const images = await Promise.all(
        imageFiles.map(async (file) => {
          try {
            const fileReference = await uploadImage(file)
            return {
              url: fileReference, // repo-file://{fileId}
              ref: file.name,
            }
          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error)
            window.alert(`Failed to upload ${file.name}: ${error.message}`)
            throw error
          }
        }),
      )

      onChange({
        code,
        images,
      })
    } catch (error) {
      console.error('Error processing files:', error)
    } finally {
      setUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  return (
    <label>
      <Label {...styles.label}>Dateien (ai2html-output)</Label>
      <Button
        onClick={() => {
          inputRef.current?.click()
        }}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <Spinner size={16} style={{ marginRight: 8 }} />
            hochladen...
          </>
        ) : (
          'hochladen'
        )}
      </Button>
      <input
        ref={inputRef}
        type='file'
        accept='text/html,image/*'
        multiple
        {...styles.input}
        onChange={handleFiles}
        disabled={uploading}
      />
    </label>
  )
}

export default FilesInput
