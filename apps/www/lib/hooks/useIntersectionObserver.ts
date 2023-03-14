import { RefObject, useEffect, useState } from 'react'

/**
 * Create an IntersectionObserver to detect when an element is visible in the viewport.
 * Once can either use the returned boolean value or the callback function to get the visibility
 * of the element.
 *
 * @param ref element to observe
 * @param options an object containing the IntersectionObserver options and a callback function
 *      that is called when the visibility of the element changes.
 * @returns [] an array containing the visibility of the element and the
 * IntersectionObserver attributes (root, rootMargin & thresholds)
 */
export function useIntersectionObserver(
  ref: RefObject<HTMLElement>,
  options?: {
    intersectionObserverOptions?: IntersectionObserverInit
    callback?: (isIntersecting: boolean) => void
  },
): [boolean, Pick<IntersectionObserver, 'root' | 'rootMargin' | 'thresholds'>] {
  const [isVisible, setIsVisible] = useState(false)
  const [observer, setObserver] = useState<IntersectionObserver>()

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (options?.callback) {
        options.callback(entry.isIntersecting)
      }
      setIsVisible(entry.isIntersecting)
    }, options?.intersectionObserverOptions)
    setObserver(observer)

    const target = ref?.current

    if (target) {
      observer.observe(target)
    }

    return () => {
      if (target) {
        observer.unobserve(target)
      }
    }
  }, [options?.callback, options?.intersectionObserverOptions, ref])

  return [
    isVisible,
    observer
      ? {
          root: observer.root,
          rootMargin: observer.rootMargin,
          thresholds: observer.thresholds,
        }
      : { root: null, rootMargin: '', thresholds: [] },
  ]
}
