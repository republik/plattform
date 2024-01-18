'use client'
import { useEffect, useState } from 'react'

export const ImageShareButton = ({ imageSrc }: { imageSrc: string }) => {
  const [canShare, setCanShare] = useState(false)

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
      await navigator.share(shareData)
    } else {
      console.log("can't share")
    }
  }

  return canShare ? (
    <button
      onClick={() => {
        handleNativeShare()
      }}
    >
      Teile dieses Bildli ⤴️
    </button>
  ) : null
}
