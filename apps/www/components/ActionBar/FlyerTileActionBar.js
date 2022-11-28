import { useState } from 'react'
import { IconButton, ShareIcon, ImageIcon, slug } from '@project-r/styleguide'
import { PUBLIC_BASE_URL } from '../../lib/constants'
import { trackEvent } from '../../lib/matomo'
import ShareOverlay from './ShareOverlay'
import { useTranslation } from '../../lib/withT'
import { css } from 'glamor'
import { postMessage } from '../../lib/withInNativeApp'
import { getShareImageUrls } from '../Article/Flyer'

const ShareButton = ({ meta, tileId, inNativeApp }) => {
  const [overlay, showOverlay] = useState(false)
  const { t } = useTranslation()

  const urlToShare = new URL(meta.path, PUBLIC_BASE_URL)
  urlToShare.searchParams.set('share', tileId)
  const url = urlToShare.toString()

  return (
    <>
      <IconButton
        label={t('article/actionbar/share')}
        labelShort={t('article/actionbar/share')}
        Icon={ShareIcon}
        href={url}
        onClick={(e) => {
          e.preventDefault()
          trackEvent(['ActionBar', 'shareJournalLink', url])
          if (inNativeApp) {
            postMessage({
              type: 'share',
              payload: {
                title: 'Republik: Journal',
                url,
                subject: '',
                dialogTitle: 'Link teilen',
              },
            })
            e.target.blur()
          } else {
            showOverlay(!overlay)
          }
        }}
      />
      {!!overlay && (
        <ShareOverlay
          onClose={() => showOverlay(false)}
          url={url}
          title={t('article/actionbar/share')}
          tweet=''
          emailSubject={t('article/share/emailSubject', {
            title: meta.title,
          })}
          emailBody=''
          emailAttachUrl
        />
      )}
    </>
  )
}

const DownloadButton = ({ documentId, meta, tileId }) => {
  const { t } = useTranslation()
  const { screenshotUrl, shareImageUrl } = getShareImageUrls(
    documentId,
    meta,
    tileId,
    true,
  )

  const downloadScreenshot = async (e) => {
    e.preventDefault()
    trackEvent(['ActionBar', 'downloadJournalBlock', screenshotUrl])

    const anchorElement = document.createElement('a')
    anchorElement.style.display = 'none'
    anchorElement.href = shareImageUrl + '&download=1'
    anchorElement.download = ''
    anchorElement.target = '_blank'
    anchorElement.textContent = 'Download'
    document.body.appendChild(anchorElement)
    anchorElement.click()
    // Cleanup
    document.body.removeChild(anchorElement)
  }

  return (
    <IconButton
      href={shareImageUrl}
      label={t('article/actionbar/download')}
      labelShort={t('article/actionbar/download')}
      Icon={ImageIcon}
      onClick={downloadScreenshot}
    />
  )
}

export const getFlyerTileActionBar =
  (documentId, meta, inNativeApp) =>
  ({ tileId }) => {
    if (!tileId) return null
    return (
      <div
        {...css({
          marginTop: 10,
          display: 'inline-flex',
        })}
      >
        <ShareButton meta={meta} tileId={tileId} inNativeApp={inNativeApp} />
        <DownloadButton meta={meta} tileId={tileId} documentId={documentId} />
      </div>
    )
  }
