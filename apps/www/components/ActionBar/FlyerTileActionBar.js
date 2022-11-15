import { useState } from 'react'
import { IconButton, ShareIcon, SparkleIcon } from '@project-r/styleguide'
import { ASSETS_SERVER_BASE_URL, PUBLIC_BASE_URL } from '../../lib/constants'
import { trackEvent } from '../../lib/matomo'
import ShareOverlay from './ShareOverlay'
import { useTranslation } from '../../lib/withT'
import { css } from 'glamor'
import { postMessage } from '../../lib/withInNativeApp'
import { getCacheKey, getShareImageUrl } from '../Article/metadata'

export const getFlyerTileActionBar =
  (documentId, meta, inNativeApp) =>
  ({ tileId }) => {
    const [overlay, showOverlay] = useState(false)
    const { t } = useTranslation()
    if (!tileId) return null
    const url = `${PUBLIC_BASE_URL}${meta.path}#${tileId}`
    const screenshotUrl = `${getShareImageUrl(meta, tileId)}&showAll=true`
    const cacheKey = getCacheKey(documentId, meta)
    const screenshotImage = `${ASSETS_SERVER_BASE_URL}/render?viewport=450x1&zoomFactor=2&updatedAt=${encodeURIComponent(
      cacheKey,
    )}&url=${encodeURIComponent(screenshotUrl)}`

    return (
      <>
        <div
          {...css({
            marginTop: 10,
            display: 'inline-flex',
          })}
        >
          <IconButton
            label='Link teilen'
            labelShort='Link teilen'
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
          <IconButton
            label='Herunterladen'
            labelShort='Herunterladen'
            Icon={SparkleIcon}
            onClick={(e) => {
              e.preventDefault()
              trackEvent(['ActionBar', 'downloadJournalBlock', url])
              window.open(screenshotImage)
            }}
            target='_blank'
          />
        </div>
        {!!overlay && (
          <ShareOverlay
            onClose={() => showOverlay(false)}
            url={url}
            title='Link teilen'
            tweet=''
            emailSubject='Republik: Journal'
            emailBody=''
            emailAttachUrl
          />
        )}
      </>
    )
  }
