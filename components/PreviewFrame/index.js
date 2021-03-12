import React, { useEffect, useState, useRef } from 'react'
import { useColorContext } from '@project-r/styleguide'
import { FRONTEND_BASE_URL } from '../../lib/settings'

import { SIDEBAR_WIDTH } from '../Sidebar'

const PREVIEW_MARGIN = 16

const screenSizes = {
  phone: {
    width: 320,
    height: 568
  },
  tablet: {
    width: 768,
    height: 1024
  },
  laptop: {
    width: 1280,
    height: 800
  },
  desktop: {
    width: 1920,
    height: 1080
  }
}

const PreviewFrame = ({ previewScreenSize, commitId, repoId }) => {
  const [scaleFactor, setScaleFactor] = useState(1)
  const [leftSpace, setLeftSpace] = useState(0)
  const [colorScheme] = useColorContext()
  const iframeRef = useRef()

  const URL = `${FRONTEND_BASE_URL}/repo/${repoId}/preview?commitId=${commitId}`

  useEffect(() => {
    const handleResize = () => {
      const windowHeight = window.innerHeight
      const windowWidth = window.innerWidth - SIDEBAR_WIDTH

      const actualPreviewWidth =
        screenSizes[previewScreenSize].width + 2 * PREVIEW_MARGIN
      const actualPreviewHeight =
        screenSizes[previewScreenSize].height + 2 * PREVIEW_MARGIN

      const exceedsWindowWidth = windowWidth <= actualPreviewWidth
      const exceedsWindowHeight = windowHeight <= actualPreviewHeight

      const widthScaleFactor = windowWidth / actualPreviewWidth
      const heightScaleFactor = windowHeight / actualPreviewHeight
      const currentScaleFactor =
        exceedsWindowHeight || exceedsWindowWidth
          ? Math.min(widthScaleFactor, heightScaleFactor)
          : 1
      setScaleFactor(currentScaleFactor)

      const scaledPreviewWidth =
        screenSizes[previewScreenSize].width * currentScaleFactor
      setLeftSpace((windowWidth - scaledPreviewWidth) / 2)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [previewScreenSize])

  return (
    <>
      <iframe
        ref={iframeRef}
        style={{
          ...screenSizes[previewScreenSize],
          transform: `scale(${scaleFactor})`,
          transformOrigin: `0 0`,
          border: 'none',
          resize: 'both',
          margin: PREVIEW_MARGIN,
          marginLeft: leftSpace
        }}
        {...colorScheme.set('backgroundColor', 'default')}
        src={URL}
      />
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'fixed',
          top: 0,
          right: 0,
          zIndex: -1
        }}
        {...colorScheme.set('backgroundColor', 'hover')}
      />
    </>
  )
}

export default PreviewFrame
