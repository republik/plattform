import { Loader, useColorContext, usePrevious } from '@project-r/styleguide'
import { useEffect, useRef, useState } from 'react'

const PREVIEW_MARGIN = 16

const screenSizes = {
  phone: {
    width: 320,
    height: 568,
  },
  tablet: {
    width: 768,
    height: 1024,
  },
  laptop: {
    width: 1280,
    height: 800,
  },
  desktop: {
    width: 1920,
    height: 1080,
  },
}

const PreviewFrame = ({
  previewScreenSize = 'phone',
  commitId,
  repoId,
  darkmode,
  hasAccess,
  sideBarWidth = 0,
  commitOnly,
}) => {
  const [scaleFactor, setScaleFactor] = useState(1)
  const [leftSpace, setLeftSpace] = useState(0)
  const [height, setHeight] = useState(0)
  const [iframeLoading, setIframeLoading] = useState()
  const [colorScheme] = useColorContext()
  const containerRef = useRef()
  const iframeRef = useRef()

  const screenSize = screenSizes[previewScreenSize]

  const src = `/repo/${repoId}/preview?commitId=${commitId}&darkmode=${darkmode}&hasAccess=${hasAccess}&commitOnly=${commitOnly}`
  const prevSrc = usePrevious(src)
  if (src !== prevSrc && !iframeLoading) {
    setIframeLoading(true)
  }
  // workaround for onload event not firing
  useEffect(() => {
    const toId = setTimeout(() => {
      setIframeLoading(false)
    }, 3000)
    return () => {
      // clear timeout e.g. when src changes again
      clearTimeout(toId)
    }
  }, [src])

  useEffect(() => {
    const handleResize = () => {
      const topOffset =
        containerRef.current.getBoundingClientRect().top + window.pageYOffset

      const availableHeight =
        window.innerHeight - topOffset - 2 * PREVIEW_MARGIN
      const availableWidth =
        document.body.clientWidth - sideBarWidth - 2 * PREVIEW_MARGIN

      const widthScaleFactor = availableWidth / screenSize.width
      const heightScaleFactor = availableHeight / screenSize.height
      const currentScaleFactor = Math.min(
        widthScaleFactor,
        heightScaleFactor,
        1,
      )
      setScaleFactor(currentScaleFactor)

      const scaledPreviewWidth = screenSize.width * currentScaleFactor
      setLeftSpace((availableWidth - scaledPreviewWidth) / 2)
      setHeight(window.innerHeight - topOffset)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [screenSize, sideBarWidth])

  const iframeStyle = {
    ...screenSize,
    minWidth: 'unset',
    transform: `scale(${scaleFactor})`,
    transformOrigin: `0 0`,
    border: 'none',
    resize: 'both',
    margin: PREVIEW_MARGIN,
    marginLeft: PREVIEW_MARGIN + leftSpace,
  }
  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          ...iframeStyle,
          position: 'absolute',
          zIndex: iframeLoading ? 2 : -1,
        }}
        {...colorScheme.set('backgroundColor', 'default')}
      >
        <Loader loading={iframeLoading} />
      </div>
      <iframe
        ref={iframeRef}
        onLoad={() => setIframeLoading(false)}
        src={src}
        style={iframeStyle}
        {...colorScheme.set('backgroundColor', 'default')}
      />
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'fixed',
          top: 0,
          right: 0,
          zIndex: -1,
        }}
        {...colorScheme.set('backgroundColor', 'hover')}
      />
    </div>
  )
}

export default PreviewFrame
