'use client'
import { useTrackEvent } from '@app/lib/matomo/event-tracking'
import { ReactNode, useEffect, useState } from 'react'

export const ShareImage = ({
  imageSrc,
  children,
}: {
  imageSrc: string
  children: ReactNode
}) => {
  const [canShare, setCanShare] = useState(false)
  const trackEvent = useTrackEvent()

  useEffect(() => {
    if (navigator.canShare) {
      setCanShare(true)
    }
  }, [])

  const handleNativeShare = async () => {
    const f = await fetch(imageSrc)
    const blob = await f.blob()
    const fname = imageSrc.split('/').reverse()[0] + '.png'
    const files = [
      new File([blob], fname, { type: 'image/png', lastModified: Date.now() }),
    ]

    const shareData = {
      files,
    }

    if (navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (e) {
        // An exception is thrown when share is cancelled, already in progress etc. We don't want to bother users with those
        // console.error(e.message)
      }
    } else {
      console.log("can't share")
    }
  }

  return canShare ? (
    <button
      onClick={() => {
        trackEvent({ action: 'shareImageNative' })
        handleNativeShare()
      }}
    >
      {children}
    </button>
  ) : null
}
