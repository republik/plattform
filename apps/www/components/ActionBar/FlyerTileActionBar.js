import { useState } from 'react'
import { IconButton, ShareIcon, ImageIcon, slug } from '@project-r/styleguide'
import { PUBLIC_BASE_URL, ASSETS_SERVER_BASE_URL } from '../../lib/constants'
import { trackEvent } from '../../lib/matomo'
import ShareOverlay from './ShareOverlay'
import { useTranslation } from '../../lib/withT'
import { css } from 'glamor'
import { postMessage } from '../../lib/withInNativeApp'
import {
  getCacheKey,
  getReferenceUrl,
  getShareImageUrl,
} from '../Article/metadata'

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
  const DEFAULT_LABEL = t('article/actionbar/download')
  const [downloadLabel, setDownloadLabel] = useState(DEFAULT_LABEL)

  const url = getReferenceUrl(meta, tileId)
  const screenshotUrl = `${getShareImageUrl(meta, tileId)}&showAll=true`
  const cacheKey = getCacheKey(documentId, meta)
  const screenshotImage = `${ASSETS_SERVER_BASE_URL}/render?viewport=450x1&zoomFactor=2&updatedAt=${encodeURIComponent(
    cacheKey,
  )}&url=${encodeURIComponent(screenshotUrl)}`

  const downloadScreenshot = async (e) => {
    e.preventDefault()
    setDownloadLabel(t('article/actionbar/download/processing'))
    trackEvent(['ActionBar', 'downloadJournalBlock', url])
    const image = await fetch(screenshotImage)
    const imageBlog = await image.blob()
    const imageURL = URL.createObjectURL(imageBlog)

    const link = document.createElement('a')
    link.href = imageURL
    link.download = slug(meta.title)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => {
      setDownloadLabel(DEFAULT_LABEL)
    }, 2000)
  }

  return (
    <IconButton
      label={downloadLabel}
      labelShort={downloadLabel}
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
