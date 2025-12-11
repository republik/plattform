import { useEffect, useRef } from 'react'

/**
 * Gives you access to the previous value, used during the previous rendering of
 * the component.
 *
 * const MyComponent = ({ value }) => {
 *   const previousValue = usePrevious(value)
 *   return <div>{value} - {previousValue}</div>
 * }
 */
export function usePrevious<T>(value: T) {
  const ref = useRef<T>(undefined)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}
