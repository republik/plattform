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
    if (!numberScrollLocks) {
      disableBodyScroll(ref.current)
    }

    numberScrollLocks += 1

    return () => {
      numberScrollLocks -= 1
      if (numberScrollLocks) {
        return
      }

      enableBodyScroll(ref.current)
    }
  }, [shouldLock])

  return [ref]
}
