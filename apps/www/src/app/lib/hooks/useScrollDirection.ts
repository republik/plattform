import { useEffect, useState } from 'react'

type ScrollDirection = 'up' | 'down'

/**
 * useScrollDirection can be used to detect the scroll direction of the user.
 * The direction swap has a default threshold of 5px, but can be configured.
 * Both the up and down threshold can be configured separately.
 * upThreshold: The amount of pixels the user has to scroll up
 *  to trigger a direction change to 'up'
 * downThreshold: The amount of pixels the user has to scroll down
 *  to trigger a direction change to 'down'
 */
export function useScrollDirection({
  threshold = 5,
  downThreshold = threshold,
  upThreshold = threshold,
}: {
  threshold?: number
  downThreshold?: number
  upThreshold?: number
} = {}): ScrollDirection | null {
  const [scrollDirection, setScrollDirection] =
    useState<ScrollDirection | null>(null)

  useEffect(() => {
    let lastScrollY = window.scrollY
    let previousScrollY = window.scrollY

    const updateScrollDirection = () => {
      const scrollY = window.scrollY
      const direction = scrollY > lastScrollY ? 'down' : 'up'

      // When suddenly scrolling in the opposite direction, reset the lastScrollY
      // to ensure the thresholds are applied from that point on.
      if (
        (direction === 'down' && scrollY < previousScrollY) ||
        (direction === 'up' && scrollY > previousScrollY)
      ) {
        lastScrollY = scrollY > 0 ? scrollY : 0
      }

      if (
        direction !== scrollDirection &&
        (scrollY - lastScrollY > downThreshold ||
          scrollY - lastScrollY < -1 * upThreshold)
      ) {
        setScrollDirection(direction)
        lastScrollY = scrollY > 0 ? scrollY : 0
      }

      previousScrollY = scrollY
    }
    window.addEventListener('scroll', updateScrollDirection) // add event listener
    return () => {
      window.removeEventListener('scroll', updateScrollDirection) // clean up
    }
  }, [scrollDirection, downThreshold, upThreshold])

  return scrollDirection
}
