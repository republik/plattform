import React, { useEffect, useState, useRef } from 'react'
import { useColorContext } from '@project-r/styleguide'
import { FRONTEND_BASE_URL } from '../../lib/settings'

import { SIDEBAR_WIDTH } from '../Sidebar'

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
      const windowHeight = window.innerHeight - 90 - 32
      const windowWidth = window.innerWidth - SIDEBAR_WIDTH - 32

      const exeedsWindowWidth =
        windowWidth <= screenSizes[previewScreenSize].width
      const exeedsWindowHeight =
        windowHeight <= screenSizes[previewScreenSize].height

      const widthScaleFactor =
        windowWidth / screenSizes[previewScreenSize].width
      const heightScaleFactor =
        windowHeight / screenSizes[previewScreenSize].height

      if (
        // if screensize is larger than either window with or height
        exeedsWindowHeight ||
        exeedsWindowWidth
      ) {
        setScaleFactor(Math.min(widthScaleFactor, heightScaleFactor))
      } else {
        setScaleFactor(1)
      }

      if (windowWidth <= screenSizes[previewScreenSize].width) {
        // if screensize exeeds window with, don't reposition
        setLeftSpace(0)
      } else {
        const iFrameWidth =
          exeedsWindowHeight || exeedsWindowWidth
            ? iframeRef.current.clientWidth *
              Math.min(heightScaleFactor, widthScaleFactor)
            : iframeRef.current.clientWidth
        setLeftSpace(windowWidth / 2 - (iFrameWidth / 2 - 16))
      }
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
          transform: `scale(${scaleFactor}) translateX(${leftSpace}px)`,
          transformOrigin: '0 0',
          border: 'none',
          resize: 'both',
          margin: 16
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
