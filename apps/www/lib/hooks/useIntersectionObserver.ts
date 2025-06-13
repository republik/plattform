'use client'
import { RefObject, useEffect, useRef, useState } from 'react'

/**
 * Create an IntersectionObserver to detect when an element is visible in the viewport.
 * The returned boolean value or the callback function can be used to retrieve the visibility
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
  const { root, rootMargin, threshold } =
    options?.intersectionObserverOptions || {}
  const [isVisible, setIsVisible] = useState(false)
  const [observer, setObserver] = useState<IntersectionObserver>()
  const callbackRef = useRef<(val: boolean) => void>(null)

  // For performance reasons we store the callback function in a ref
  // to ensure the intersection observer is not recreated on every render
  useEffect(() => {
    callbackRef.current = options?.callback
  }, [options?.callback])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (callbackRef.current) {
          callbackRef.current(entry.isIntersecting)
        }
        setIsVisible(entry.isIntersecting)
      },
      {
        root,
        rootMargin,
        threshold,
      },
    )
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
  }, [ref?.current, root, rootMargin, threshold])

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
