import React from 'react'

export default ({ preview }) => {
  return preview ? (
    <>
      {preview.linkPreview && (
        <img src={preview.linkPreview.imageUrl} width='200' />
      )}
    </>
  ) : null
}
