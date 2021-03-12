import React, { useEffect, useState, useRef } from 'react'
import { useColorContext } from '@project-r/styleguide'
import { PUBLIC_BASE_URL } from '../../lib/settings'

import { SIDEBAR_WIDTH } from '../Sidebar'
import { HEADER_HEIGHT } from '../Frame/constants'

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

const PreviewFrame = ({ previewScreenSize, commitId, repoId, darkmode }) => {
  const [scaleFactor, setScaleFactor] = useState(1)
  const [leftSpace, setLeftSpace] = useState(0)
  const [colorScheme] = useColorContext()
  const iframeRef = useRef()

  const URL = `${PUBLIC_BASE_URL}/repo/${repoId}/preview?commitId=${commitId}&darkmode=${darkmode}`
  useEffect(() => {
    const handleResize = () => {
      const availableHeight =
        window.innerHeight - HEADER_HEIGHT - 2 * PREVIEW_MARGIN
      const availableWidth =
        window.innerWidth - SIDEBAR_WIDTH - 2 * PREVIEW_MARGIN

      const widthScaleFactor =
        availableWidth / screenSizes[previewScreenSize].width
      const heightScaleFactor =
        availableHeight / screenSizes[previewScreenSize].height
      const currentScaleFactor = Math.min(
        widthScaleFactor,
        heightScaleFactor,
        1
      )
      setScaleFactor(currentScaleFactor)

      const scaledPreviewWidth =
        screenSizes[previewScreenSize].width * currentScaleFactor
      setLeftSpace((availableWidth - scaledPreviewWidth) / 2)
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
          marginLeft: PREVIEW_MARGIN + leftSpace
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
