'use client'
import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'
import { IconShare } from '@republik/icons'
import { ShareNative } from './share-native'
import { ShareOverlay } from './share-overlay'
import { ShareProps } from './types'
import { hstack } from '@app/styled-system/patterns'
import { css } from '@app/styled-system/css'

export function Share({ title, url, emailSubject }: ShareProps) {
  const { isNativeApp } = usePlatformInformation()

  const label = (
    <div
      className={hstack({
        gap: '2',
        color: 'text',
        textStyle: 'sansSerifBold',
        fontSize: 'm',
        cursor: 'pointer',
        _hover: {
          color: 'contrast',
        },
      })}
    >
      <IconShare size={20} /> Teilen
    </div>
  )

  // TODO: implement share overlay
  //<ShareOverlay triggerLabel={label}>huh</ShareOverlay>

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
        triggerLabel={label}
      />
    </div>
  ) : null
}
