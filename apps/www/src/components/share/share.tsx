'use client'
import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'
import { css } from '@app/styled-system/css'
import { ReactNode } from 'react'
import { ShareNative } from './share-native'
import { ShareOverlay } from './share-overlay'
import { ShareProps } from './types'

export function Share({
  title,
  url,
  emailSubject,
  children,
}: ShareProps & { children: ReactNode }) {
  const { isNativeApp } = usePlatformInformation()

  return isNativeApp ? (
    <div
      className={css({
        display: 'flex',
        width: 'full',
        justifyContent: 'center',
      })}
    >
      <ShareNative
        title={title}
        url={url}
        emailSubject={emailSubject}
        triggerLabel={children}
      />
    </div>
  ) : (
    <ShareOverlay
      title={title}
      url={url}
      emailSubject={emailSubject}
      triggerLabel={children}
    />
  )
}
