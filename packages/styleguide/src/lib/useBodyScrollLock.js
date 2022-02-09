import { useEffect, useRef } from 'react'
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'

import warn from './warn'

let lockedElements = []

const options = {
  allowTouchMove: (el) => {
    if (
      el.tagName === 'INPUT' &&
      el.type &&
      el.type.toLowerCase() === 'range'
    ) {
      return true
    }
    while (el && el !== document.body) {
      if (el.getAttribute('data-body-scroll-lock-ignore') !== null) {
        return true
      }

      el = el.parentNode
    }
  },
}

export const isBodyScrollLocked = () => lockedElements.length > 0

export const useBodyScrollLock = (lock = true) => {
  const ref = useRef()

  const shouldLock = !!lock
  useEffect(() => {
    if (!shouldLock) {
      return
    }
    if (!ref.current) {
      warn('[useBodyScrollLock]', 'ref is not assigned')
      return
    }
    const targetElement = ref.current
    const lastLockedElement = lockedElements[lockedElements.length - 1]

    if (lastLockedElement !== targetElement) {
      clearAllBodyScrollLocks()
      disableBodyScroll(targetElement, options)
      lockedElements.push(targetElement)
    }

    return () => {
      clearAllBodyScrollLocks()
      lockedElements = lockedElements.filter(
        (element) => element !== targetElement,
      )
      const prevLockedElement = lockedElements[lockedElements.length - 1]
      if (prevLockedElement) {
        disableBodyScroll(prevLockedElement, options)
      }
    }
  }, [shouldLock])

  return [ref]
}
