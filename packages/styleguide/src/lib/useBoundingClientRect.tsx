import React from 'react'

/**
 * const [ref, { width, height }] = useBoundingClientRect([text])
 * <div ref={ref}>{text}</div>
 *
 * Make sure to pass any dependencies to the hook which may change the bounding
 * client rect. Without the deps this hook will only measure the initial size.
 */
export function useBoundingClientRect(
  deps: React.DependencyList = [],
): [(_: HTMLElement) => void, DOMRect] {
  const [rect, setRect] = React.useState<DOMRect>(null)

  return [
    React.useCallback((el: HTMLElement) => {
      if (el) {
        setRect(el.getBoundingClientRect())
      }
    }, deps), // eslint-disable-line react-hooks/exhaustive-deps
    rect,
  ]
}
