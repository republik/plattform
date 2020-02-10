import { useEffect, useRef } from 'react'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'

import warn from './warn'

let numberScrollLocks = 0

export const isBodyScrollLocked = () => numberScrollLocks > 0

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
    if (!numberScrollLocks) {
      disableBodyScroll(targetElement)
    }

    numberScrollLocks += 1

    return () => {
      numberScrollLocks -= 1
      if (numberScrollLocks) {
        return
      }

      enableBodyScroll(targetElement)
    }
  }, [shouldLock])

  return [ref]
}
