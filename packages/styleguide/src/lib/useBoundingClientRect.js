import React from 'react'

/**
 * const [ref, { width, height }] = useBoundingClientRect([text])
 * <div ref={ref}>{text}</div>
 *
 * Make sure to pass any dependencies to the hook which may change the bounding
 * client rect. Without the deps this hook will only measure the initial size.
 */
export const useBoundingClientRect = (deps = []) => {
  const [rect, setRect] = React.useState({})

  return [
    React.useCallback((el) => {
      if (el) {
        setRect(el.getBoundingClientRect())
      }
    }, deps), // eslint-disable-line react-hooks/exhaustive-deps
    rect,
  ]
}
