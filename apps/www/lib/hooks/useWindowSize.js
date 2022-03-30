import { useState, useEffect } from 'react';

export const useWindowSize = () => {
  const [size, setSize] = useState([])

  useEffect(() => {
    const handleResize = () => {
      if (
        navigator.userAgent &&
        navigator.userAgent.match(/iPad|iPhone|iPod/)
      ) {
        // bogus window.innerWidth & window.innerHeight values on iOS when rotating
        // https://bugs.webkit.org/show_bug.cgi?id=170595
        const { width, height } =
          document.documentElement.getBoundingClientRect()
        setSize([
          Math.max(window.innerWidth, width),
          Math.max(window.innerHeight, height),
        ])
      } else {
        setSize([window.innerWidth, window.innerHeight])
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [setSize])

  return size
}
