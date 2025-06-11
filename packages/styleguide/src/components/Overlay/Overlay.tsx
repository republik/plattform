import React, {
  useState,
  useEffect,
  useRef,
  ReactNode,
  MouseEventHandler,
  Ref,
} from 'react'
import ReactDOM from 'react-dom'
import { css, merge } from 'glamor'

import zIndex from '../../theme/zIndex'
import { mUp, onlyS } from '../../theme/mediaQueries'
import { useBodyScrollLock } from '../../lib/useBodyScrollLock'

import { useColorContext } from '../Colors/ColorContext'

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
  miniContainer: css({
    [mUp]: {
      minHeight: 'inherit',
    },
    [onlyS]: {
      minHeight: 'inherit',
      position: 'fixed',
      bottom: 0,
      width: '100%',
    },
  }),
}

const ssrAttribute = 'data-overlay-ssr'

type OverlayProps = {
  onClose: MouseEventHandler<HTMLButtonElement>
  children?: ReactNode
  mUpStyle?: MUpStyle
  mini?: boolean
}

const Overlay: React.FC<OverlayProps> = ({
  onClose,
  children,
  mUpStyle,
  mini,
}) => {
  const rootDom = useRef<HTMLDivElement>(null)
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

  const [scrollRef] = useBodyScrollLock<HTMLDivElement>(!ssrMode)
  const element = (
    <OverlayRenderer
      onClose={onClose}
      mUpStyle={mUpStyle}
      scrollRef={scrollRef}
      isVisible={isVisible}
      ssrMode={ssrMode}
      mini={mini}
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
    scrollRef?: Ref<HTMLDivElement>
  }
> = ({ isVisible, mUpStyle, children, onClose, mini, ssrMode, scrollRef }) => {
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
        {...merge(
          styles.inner,
          mini && styles.miniContainer,
          mUpStyle && { [mUp]: mUpStyle },
        )}
        {...colorScheme.set('backgroundColor', 'overlay')}
        {...colorScheme.set('boxShadow', 'overlay')}
        {...colorScheme.set('color', 'text')}
      >
        {children}
      </div>
    </div>
  )
}
