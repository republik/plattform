import { useEffect, useRef } from 'react'

/**
 * useInterval allows you to use to set an interval on a callback
 * that may be updated, without the interval being reset.
 * If no delay is provided, the interval will not be set.
 * @param callback the callback to be called on the interval
 * @param delay in ms, if null or a negative number is passed, the interval will be cleared
 */
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>(null)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current()
      }
    }
    if (delay !== null || delay < 0) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

export default useInterval
