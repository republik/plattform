import React, {
  useState,
  useEffect,
  useRef,
  ReactNode,
  MouseEventHandler,
  RefObject,
} from 'react'
import ReactDOM from 'react-dom'
import { css, merge } from 'glamor'
import zIndex from '../../theme/zIndex'
import { mUp } from '../../theme/mediaQueries'
import { useColorContext } from '../Colors/ColorContext'

import { useBodyScrollLock } from '../../lib/useBodyScrollLock'

const styles = {
  root: css({
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: zIndex.overlay,
    transition: 'opacity .12s ease-in-out',
    background: 'rgba(0,0,0,.2)',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  }),
  backdrop: css({
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    height: '100vh',
    width: '100vw',
  }),
  inner: css({
    position: 'relative',
    zIndex: 1, // to establish a stacking context
    minHeight: '100vh',
    [mUp]: {
      maxWidth: '600px',
      minHeight: '60vh',
      height: 'auto',
      margin: '20vh auto 20vh',
    },
  }),
}

const ssrAttribute = 'data-overlay-ssr'

type OverlayProps = {
  onClose: MouseEventHandler<HTMLButtonElement>
  children: ReactNode
  mUpStyle?: MUpStyle
}

const Overlay: React.FC<OverlayProps> = ({ onClose, children, mUpStyle }) => {
  const rootDom = useRef<HTMLDivElement>()
  const isDomAvailable = typeof document !== 'undefined'
  if (isDomAvailable && !rootDom.current) {
    rootDom.current = document.createElement('div')
    document.body.appendChild(rootDom.current)
  }

  const [ssrMode, setSsrMode] = useState(
    () =>
      !isDomAvailable ||
      (isDomAvailable &&
        document.querySelectorAll(`[${ssrAttribute}]`).length > 0),
  )
  const [isVisible, setIsVisible] = useState(ssrMode)

  useEffect(() => {
    const fadeInTimeout = setTimeout(() => {
      setIsVisible(true)
    }, 33)
    return () => {
      clearTimeout(fadeInTimeout)
      document.body.removeChild(rootDom.current)
    }
  }, [])

  useEffect(() => {
    if (ssrMode) {
      setSsrMode(false)
    }
  }, [ssrMode])

  useEffect(() => {
    const handleEscClick = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose(null)
      }
    }

    document.addEventListener('keyup', handleEscClick)

    return () => {
      document.removeEventListener('keyup', handleEscClick)
    }
  }, [onClose])

  const [scrollRef] = useBodyScrollLock(!ssrMode)
  const element = (
    <OverlayRenderer
      onClose={onClose}
      mUpStyle={mUpStyle}
      scrollRef={scrollRef}
      isVisible={isVisible}
      ssrMode={ssrMode}
    >
      {children}
    </OverlayRenderer>
  )

  if (!ssrMode) {
    return ReactDOM.createPortal(element, rootDom.current)
  }
  return element
}

export default Overlay

type MUpStyle = {
  maxWidth?: number | string
  marginTop?: number | string
  marginBottom?: number | string
  minHeight?: number | string
}

// This is the actual Overlay component that is rendered. We export this so we
// can document the overlay in the catalog without affecting 'document.body'.
export const OverlayRenderer: React.FC<
  OverlayProps & {
    isVisible: boolean
    ssrMode?: boolean
    scrollRef?: RefObject<HTMLDivElement>
  }
> = ({ isVisible, mUpStyle, children, onClose, ssrMode, scrollRef }) => {
  const close = (e) => {
    e.preventDefault()
    onClose(e)
  }
  const [colorScheme] = useColorContext()

  return (
    <div
      {...styles.root}
      {...(ssrMode && { [ssrAttribute]: true })}
      style={{ opacity: isVisible ? 1 : 0 }}
      ref={scrollRef}
    >
      <div {...styles.backdrop} onClick={close} />
      <div
        {...merge(styles.inner, mUpStyle && { [mUp]: mUpStyle })}
        {...colorScheme.set('backgroundColor', 'overlay')}
        {...colorScheme.set('boxShadow', 'overlay')}
        {...colorScheme.set('color', 'text')}
      >
        {children}
      </div>
    </div>
  )
}
