'use client'

import { usePostMessage } from '@app/lib/hooks/usePostMessage'
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
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        // trackEvent(['ActionBar', 'share', url])
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
