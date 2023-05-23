import { useState } from 'react'

import {
  Overlay,
  OverlayBody,
  OverlayToolbar,
  A,
  Button,
  Checkbox,
  Radio,
} from '@project-r/styleguide'
import withT from '../../lib/withT'
import { ASSETS_SERVER_BASE_URL } from '../../lib/constants'
import { IconDownload } from '@republik/icons'

export const getPdfUrl = (
  meta,
  { images = true, download = false, pageSize } = {},
) => {
  const query = [
    pageSize && pageSize !== 'A4' && `size=${pageSize}`,
    !images && 'images=0',
    download && 'download=1',
  ].filter(Boolean)
  return `${ASSETS_SERVER_BASE_URL}/pdf${meta.path}.pdf${
    query.length ? `?${query.join('&')}` : ''
  }`
}

const matchFigure = (node) =>
  node.type === 'zone' && node.identifier === 'FIGURE'
const matchVideo = (node) =>
  node.type === 'zone' &&
  node.identifier === 'EMBEDVIDEO' &&
  node.data.forceAudio

export const countImages = (element) => {
  if (matchFigure(element) || matchVideo(element)) {
    return 1
  }
  return (element.children || []).reduce(
    (count, node) => count + countImages(node),
    0,
  )
}

const PdfOverlay = ({ onClose, article, t }) => {
  const [images, setImages] = useState(true)
  const [pageSize, setPageSize] = useState('A4')
  const imageCount = countImages(article.content)

  return (
    <Overlay onClose={onClose} mUpStyle={{ maxWidth: 300, minHeight: 0 }}>
      <OverlayToolbar title={t('article/pdf/title')} onClose={onClose} />
      <OverlayBody>
        <div style={{ marginBottom: 10 }}>
          {['A4', 'A5'].map((size) => (
            <Radio
              key={size}
              value={size}
              checked={pageSize === size}
              onChange={() => setPageSize(size)}
              style={{
                marginRight: 10,
                marginBottom: 10,
              }}
            >
              {t(`article/pdf/size/${size}`)}{' '}
            </Radio>
          ))}
        </div>
        {!!imageCount && (
          <>
            <Checkbox
              checked={images}
              onChange={(_, checked) => {
                setImages(checked)
              }}
            >
              {t.pluralize('article/pdf/images', {
                count: imageCount,
              })}
            </Checkbox>
            <br />
            <br />
          </>
        )}
        <Button block href={getPdfUrl(article.meta, { pageSize, images })}>
          {t('article/pdf/open')}
        </Button>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <A
            target='_blank'
            href={getPdfUrl(article.meta, {
              pageSize,
              images,
              download: true,
            })}
            download
          >
            <IconDownload /> {t('article/pdf/download')}
          </A>
        </div>
      </OverlayBody>
    </Overlay>
  )
}

export default withT(PdfOverlay)
