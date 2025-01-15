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
  { images = true, download = false, format } = {},
) => {
  const url = new URL(`${ASSETS_SERVER_BASE_URL}/pdf${meta.path}.pdf`)
  url.searchParams.set('format', format)
  url.searchParams.set('images', images)
  url.searchParams.set('download', download)
  url.searchParams.set('version', meta.lastPublishedAt)
  return url.toString()
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

        <Button block href={getPdfUrl(article.meta, { pageFormat, images })}>
          {t('article/pdf/open')}
        </Button>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <A
            target='_blank'
            href={getPdfUrl(article.meta, {
              pageFormat,
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
