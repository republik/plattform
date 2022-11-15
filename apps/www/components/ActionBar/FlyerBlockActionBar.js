import { useState } from 'react'
import { IconButton, ShareIcon, SparkleIcon } from '@project-r/styleguide'
import { PUBLIC_BASE_URL } from '../../lib/constants'
import { trackEvent } from '../../lib/matomo'
import ShareOverlay from './ShareOverlay'
import { useTranslation } from '../../lib/withT'
import { css } from 'glamor'
import { postMessage } from '../../lib/withInNativeApp'
import { getShareImageUrl } from '../Article/metadata'

export const getFlyerBlockActionBar =
  (documentId, meta, inNativeApp) =>
  ({ blockId }) => {
    const [overlay, showOverlay] = useState(false)
    const { t } = useTranslation()
    if (!blockId) return null
    const url = `${PUBLIC_BASE_URL}${meta.path}#${blockId}`
    const screenshot = `${getShareImageUrl(meta, blockId)}&showAll=true`

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
            href={screenshot}
            onClick={(e) => {
              console.log('hm')
              e.preventDefault()
              trackEvent(['ActionBar', 'downloadJournalBlock', url])
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
