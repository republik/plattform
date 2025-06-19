import { useEffect, useRef } from 'react'

/**
 * useTimeout allows you to use to set a timeout on a callback
 * that may be updated, without the timeout being reset.
 * If no delay is provided, the timeout will not be set.
 * @param callback the callback to be called on the interval
 * @param timeout in ms, if null or a negative number is passed, the timeout will be cleared
 */
function useTimeout(callback: () => void, timeout: number | null) {
  const savedCallback = useRef<() => void>(null)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    function handler() {
      if (savedCallback.current) {
        savedCallback.current()
      }
    }
    if (timeout !== null || timeout < 0) {
      const id = setTimeout(handler, timeout)
      return () => clearTimeout(id)
    }
  }, [timeout])
}

export default useTimeout
