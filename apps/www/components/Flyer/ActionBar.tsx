import React, { useState } from 'react'
import { css } from 'glamor'

import { IconButton } from '@project-r/styleguide'

import { PUBLIC_BASE_URL } from '../../lib/constants'
import { trackEvent } from '../../lib/matomo'
import { useTranslation } from '../../lib/withT'
import { postMessage } from '../../lib/withInNativeApp'

import ShareOverlay from '../ActionBar/ShareOverlay'

import { getShareImageUrls } from './Meta'
import { MetaProps } from './index'
import { IconImage, IconShare } from '@republik/icons'

const ShareButton: React.FC<{
  meta: MetaProps
  tileId: string
  inNativeApp: boolean
}> = ({ meta, tileId, inNativeApp }) => {
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
        Icon={IconShare}
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

const DownloadButton: React.FC<{
  documentId: string
  meta: MetaProps
  tileId: string
}> = ({ documentId, meta, tileId }) => {
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
      Icon={IconImage}
      onClick={downloadScreenshot}
    />
  )
}

export const getTileActionBar: (
  documentId: string,
  meta: MetaProps,
  inNativeApp: boolean,
) => React.FC<{ tileId?: string }> =
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
