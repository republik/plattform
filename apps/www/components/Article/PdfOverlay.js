import { useState } from 'react'

import {
  Overlay,
  OverlayBody,
  OverlayToolbar,
  Button,
  Checkbox,
  Radio,
} from '@project-r/styleguide'

import withT from '../../lib/withT'

import {
  PUBLIC_BASE_URL,
  SCREENSHOT_SERVER_BASE_URL,
} from '../../lib/constants'

export const getPdfUrl = (
  { path, lastPublishedAt },
  { images, pageFormat } = {},
) => {
  const pdfUrl = new URL('/api/pdf', SCREENSHOT_SERVER_BASE_URL)

  const articleUrl = `${PUBLIC_BASE_URL}/${path}`

  pdfUrl.searchParams.set('url', articleUrl)
  pdfUrl.searchParams.set('version', lastPublishedAt)
  pdfUrl.searchParams.set('images', images ? 'true' : 'false')

  if (pageFormat) pdfUrl.searchParams.set('format', pageFormat)

  return pdfUrl.toString()
}

const PdfOverlay = ({ onClose, article, t }) => {
  const [images, setImages] = useState(true)
  const [pageFormat, setPageFormat] = useState('A4')

  return (
    <Overlay onClose={onClose} mUpStyle={{ maxWidth: 300, minHeight: 0 }}>
      <OverlayToolbar title={t('article/pdf/title')} onClose={onClose} />
      <OverlayBody>
        {['A4', 'A5'].map((format) => (
          <Radio
            key={format}
            value={format}
            checked={pageFormat === format}
            onChange={() => setPageFormat(format)}
            style={{
              marginRight: 10,
              marginBottom: 10,
            }}
          >
            {format}
          </Radio>
        ))}
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <Checkbox
            checked={images}
            onChange={(_, checked) => {
              setImages(checked)
            }}
          >
            {t('article/pdf/images')}
          </Checkbox>
        </div>

        <Button
          block
          target='_blank'
          href={getPdfUrl(article.meta, { pageFormat, images })}
        >
          {t('article/pdf/open')}
        </Button>
      </OverlayBody>
    </Overlay>
  )
}

export default withT(PdfOverlay)
