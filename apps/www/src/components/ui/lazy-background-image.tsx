import { HTMLAttributes, ReactNode, useEffect, useRef } from 'react'

export function LazyBackgroundImage({
  backgroundImage,
  children,
  ...attrs
}: {
  backgroundImage: string
  children: ReactNode
} & HTMLAttributes<HTMLDivElement>) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // console.log('Loading background image:', backgroundImage)
          const ele = entry.target as HTMLDivElement
          ele.style.backgroundImage = `url(${backgroundImage})`
          // Once the image is loaded, we can stop observing
          observer.unobserve(ele)
        }
      },
      {
        threshold: 0,
        rootMargin: '50px',
      },
    )
    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [backgroundImage])

  return (
    <div ref={elementRef} {...attrs}>
      {children}
    </div>
  )
}
