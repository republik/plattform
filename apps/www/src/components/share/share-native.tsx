'use client'

import { usePostMessage } from '@app/lib/hooks/usePostMessage'
import { ReactNode } from 'react'
import type { ShareProps } from './types'
import { css } from '@app/styled-system/css'
import { useTrackEvent } from '@app/lib/matomo/event-tracking'

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
    <button
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
    </button>
  )
}
