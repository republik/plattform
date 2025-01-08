import { useState } from 'react'

import { IconButton } from '@project-r/styleguide'
import { trackEvent } from '@app/lib/analytics/event-tracking'

import { postMessage, useInNativeApp } from '../../../lib/withInNativeApp'
import { useTranslation } from '../../../lib/withT'

import { IconShare } from '@republik/icons'

import ShareOverlay from '../../ActionBar/ShareOverlay'

export const HeaderShare = ({ meta, noLabel }) => {
  const { t } = useTranslation()
  const { inNativeApp } = useInNativeApp()
  const [overlay, showOverlay] = useState(false)
  const { url, title } = meta

  return (
    <>
      <IconButton
        label={!noLabel && t('article/actionbar/share')}
        labelShort=''
        Icon={IconShare}
        href={url}
        onClick={(e) => {
          e.preventDefault()
          trackEvent(['ActionBar', 'shareQuestionnaireLink', url])
          if (inNativeApp) {
            postMessage({
              type: 'share',
              payload: {
                title: title,
                url,
                subject: '',
                dialogTitle: t('article/share/title'),
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
          emailSubject={t('article/share/emailSubject', {
            title: title,
          })}
          emailBody=''
          emailAttachUrl
        />
      )}
    </>
  )
}

export default HeaderShare
