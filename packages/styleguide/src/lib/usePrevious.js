import React from 'react'

/**
 * Gives you access to the previous value, used during the previous rendering of
 * the component.
 *
 * const MyComponent = ({ value }) => {
 *   const previousValue = usePrevious(value)
 *   return <div>{value} - {previousValue}</div>
 * }
 */
export const usePrevious = (value) => {
  const ref = React.useRef()

  React.useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}
