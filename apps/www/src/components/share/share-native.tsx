'use client'

import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { usePostMessage } from '@app/lib/hooks/usePostMessage'
import { css } from '@republik/theme/css'
import { ReactNode } from 'react'
import type { ShareProps } from './types'

export function ShareNative({
  title,
  url,
  emailSubject,
  triggerLabel,
}: ShareProps & {
  triggerLabel: ReactNode
}) {
  const postMessage = usePostMessage()
  const trackEvent = useTrackEvent()
  return (
    <div
      role='button'
      className={css({ textAlign: 'left' })}
      onClick={(e) => {
        e.preventDefault()
        trackEvent({ action: 'shareNative', name: url })
        postMessage({
          type: 'share',
          payload: {
            title: title,
            url: url,
            subject: emailSubject,
            dialogTitle: 'Teilen',
          },
        })
        e.currentTarget.blur()
      }}
    >
      {triggerLabel}
    </div>
  )
}
