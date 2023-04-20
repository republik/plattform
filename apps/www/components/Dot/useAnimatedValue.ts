import {
  AnimationOptions,
  MotionValue,
  animate,
  useMotionValue,
  useTransform,
} from 'framer-motion'
import { useEffect, useRef } from 'react'

const defaultFmt = (value: number) => Math.round(value).toString()

export const useAnimatedValue = ({
  value,
  initialValue = 0,
  format = defaultFmt,
  transition = { duration: 1 },
}: {
  value: number
  initialValue?: number
  format?: (value: number) => string
  transition?: AnimationOptions<number>
}) => {
  const count = useMotionValue(initialValue)
  const rounded = useTransform(count, format)

  useEffect(() => {
    const animationControls = animate(count, value, transition)
    return animationControls.stop
  }, [count, value, transition])

  return rounded
}

export const useMotionValueTextContent = (value: MotionValue<string>) => {
  const elRef = useRef<SVGTSpanElement>(null)
  let changed = false

  useEffect(() => {
    if (!changed) {
      elRef.current.textContent = value.get()
    }

    return value.onChange((v) => {
      changed = true
      if (elRef.current) {
        elRef.current.textContent = v
      }
    })
  }, [value])

  return elRef
}
