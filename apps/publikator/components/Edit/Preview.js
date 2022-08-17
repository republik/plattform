import { useEffect, useState, useRef } from 'react'
import {
  useColorContext,
  Loader,
  EditorToolbar,
  IconButton,
  colors,
  EDITOR_TOOLBAR_HEIGHT,
} from '@project-r/styleguide'
import { HEADER_HEIGHT } from '../Frame/constants'
import {
  MdPhoneIphone,
  MdTabletMac,
  MdLaptopMac,
  MdDesktopMac,
} from 'react-icons/md'
import { editorToolbarStyle } from '../ContentEditor'

const PREVIEW_MARGIN = 16

const devices = ['phone', 'tablet', 'laptop', 'desktop']

const screenSizes = {
  phone: {
    width: 320,
    height: 568,
    name: 'phone',
    label: 'Mobile',
    Icon: MdPhoneIphone,
  },
  tablet: {
    width: 768,
    height: 1024,
    name: 'tablet',
    label: 'Tablet',
    Icon: MdTabletMac,
  },
  laptop: {
    width: 1280,
    height: 800,
    name: 'laptop',
    label: 'Laptop',
    Icon: MdLaptopMac,
  },
  desktop: {
    width: 1920,
    height: 1080,
    name: 'desktop',
    label: 'Desktop',
    Icon: MdDesktopMac,
  },
}

const PreviewFrame = ({ commitId, repoId }) => {
  const [previewScreenSize, setPreviewScreenSize] = useState('phone')
  const [scaleFactor, setScaleFactor] = useState(1)
  const [leftSpace, setLeftSpace] = useState(0)
  const [iframeLoading, setIframeLoading] = useState(true)
  const [colorScheme] = useColorContext()
  const iframeRef = useRef()

  const iframeSrc = `/flyer/${repoId}/preview?commitId=${commitId}`

  useEffect(() => {
    const handleResize = () => {
      const availableHeight =
        window.innerHeight -
        HEADER_HEIGHT -
        EDITOR_TOOLBAR_HEIGHT -
        2 * PREVIEW_MARGIN
      const availableWidth = document.body.clientWidth - 2 * PREVIEW_MARGIN

      const widthScaleFactor =
        availableWidth / screenSizes[previewScreenSize].width
      const heightScaleFactor =
        availableHeight / screenSizes[previewScreenSize].height
      const currentScaleFactor = Math.min(
        widthScaleFactor,
        heightScaleFactor,
        1,
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

  const iframeStyle = {
    ...screenSizes[previewScreenSize],
    minWidth: 'unset',
    transform: `scale(${scaleFactor})`,
    transformOrigin: `0 0`,
    border: 'none',
    resize: 'both',
    margin: PREVIEW_MARGIN,
    marginLeft: PREVIEW_MARGIN + leftSpace,
  }

  return (
    <>
      <EditorToolbar
        mode='sticky'
        style={{ ...editorToolbarStyle, padding: 10 }}
        centered
      >
        {devices.map((key) => {
          const size = screenSizes[key]
          return (
            <IconButton
              Icon={size.Icon}
              title={size.label}
              label={size.label}
              key={key}
              onClick={() => setPreviewScreenSize(key)}
              fill={key === previewScreenSize ? colors.primary : colors.text}
            />
          )
        })}
      </EditorToolbar>
      <div
        style={{
          width: '100vw',
          height: `calc(100vh - ${HEADER_HEIGHT}px - ${EDITOR_TOOLBAR_HEIGHT}px)`,
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
          style={{
            ...iframeStyle,
          }}
          {...colorScheme.set('backgroundColor', 'default')}
          src={iframeSrc}
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
    </>
  )
}

export default PreviewFrame
