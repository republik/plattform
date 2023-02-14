import { useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import ReactConfetti from 'react-confetti'
import useTimeout from '../../../lib/hooks/useTimeout'

const Confetti = () => {
  const [isRunning, setRunning] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  useTimeout(() => {
    setRunning(true)
  }, 1000)

  if (shouldReduceMotion || !isRunning) {
    return null
  }

  return (
    <ReactConfetti
      run={isRunning}
      recycle={false}
      numberOfPieces={800}
      tweenDuration={10000}
      onConfettiComplete={() => setRunning(false)}
      style={{ overflow: 'hidden', width: '100%' }}
    />
  )
}

export default Confetti
