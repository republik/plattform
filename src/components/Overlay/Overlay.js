import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { css, merge } from 'glamor'
import zIndex from '../../theme/zIndex'
import { mUp } from '../../theme/mediaQueries'
import colors from '../../theme/colors'
import ColorContext from '../Colors/ColorContext'

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
    [mUp]: {
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch'
    }
  }),
  inner: css({
    position: 'relative',
    zIndex: 1, // to establish a stacking context
    background: 'white',
    height: '100vh',
    boxShadow: '0 0 6px rgba(0,0,0,.2)',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    color: colors.text,
    [mUp]: {
      maxWidth: '600px',
      minHeight: '60vh',
      height: 'auto',
      margin: '20vh auto 20vh',
      overflowY: 'visible'
    }
  })
}

const ssrAttribute = 'data-overlay-ssr'

let numberBodyLocks = 0
const lockBodyScroll = () => {
  let pageYOffset
  if (!numberBodyLocks) {
    // The code below is used to block scrolling of the page behind the overlay.
    document.body.style.overflow = 'hidden'
    // does not work on iOS
    // therefore we additionally make the body unscrollable with position fixed
    if (navigator.userAgent && navigator.userAgent.match(/iPad|iPhone|iPod/)) {
      // The trick is to add position:fixed to the body element.
      // This scrolls the page to the top, to counter that we shift
      // the whole page up by the appropriate offset and restore the scroll offset
      // when the overlay is dismissed.
      pageYOffset = window.pageYOffset
      document.documentElement.style.top = `-${pageYOffset}px`
      document.documentElement.style.position = 'relative'
      document.body.style.position = 'fixed'
      document.body.style.left = '0'
      document.body.style.right = '0'
    }
  }

  numberBodyLocks += 1

  return () => {
    numberBodyLocks -= 1
    if (numberBodyLocks) {
      return
    }

    // Remove scroll block
    document.body.style.overflow = ''

    if (pageYOffset) {
      // Remove scroll block and scroll page back to its original Y-offset.
      document.documentElement.style.top = ''
      document.documentElement.style.position = ''
      document.body.style.position = ''
      document.body.style.left = ''
      document.body.style.right = ''
      window.scrollTo(0, pageYOffset)
    }
  }
}

const Overlay = props => {
  const rootDom = useRef()
  const isDomAvailable = typeof document !== 'undefined'
  if (isDomAvailable && !rootDom.current) {
    rootDom.current = document.createElement('div')
  }

  const [ssrMode, setSsrMode] = useState(
    () =>
      !isDomAvailable ||
      (isDomAvailable &&
        document.querySelectorAll(`[${ssrAttribute}]`).length > 0)
  )
  const [isVisible, setIsVisible] = useState(ssrMode)

  useEffect(() => {
    const fadeInTimeout = setTimeout(() => {
      setIsVisible(true)
    }, 33)

    const unlockBody = lockBodyScroll()
    document.body.appendChild(rootDom.current)

    return () => {
      clearTimeout(fadeInTimeout)

      unlockBody()
      document.body.removeChild(rootDom.current)
    }
  }, [])
  useEffect(() => {
    if (ssrMode) {
      setSsrMode(false)
    }
  }, [ssrMode])

  const element = (
    <OverlayRenderer {...props} isVisible={isVisible} ssrMode={ssrMode} />
  )

  if (!ssrMode) {
    return ReactDOM.createPortal(element, rootDom.current)
  }
  return element
}

Overlay.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired
}

export default Overlay

// This is the actual Overlay component that is rendered. We export this so we
// can document the overlay in the catalog without affecting 'document.body'.
export const OverlayRenderer = ({
  isVisible,
  mUpStyle,
  children,
  onClose,
  ssrMode
}) => {
  const close = e => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      {...styles.root}
      {...(ssrMode && { [ssrAttribute]: true })}
      style={{ opacity: isVisible ? 1 : 0 }}
      onClick={close}
    >
      <ColorContext.Provider value={colors}>
        <div {...merge(styles.inner, mUpStyle && { [mUp]: mUpStyle })}>
          {children}
        </div>
      </ColorContext.Provider>
    </div>
  )
}

OverlayRenderer.propTypes = {
  mUpStyle: PropTypes.shape({
    maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    marginTop: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    marginBottom: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  }),
  children: PropTypes.node.isRequired,
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}
