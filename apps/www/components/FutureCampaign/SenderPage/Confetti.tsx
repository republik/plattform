import { plainButtonRule } from '@project-r/styleguide'
import { useReducedMotion } from 'framer-motion'
import { useState } from 'react'
// import ReactConfetti from 'react-confetti'
import useTimeout from '../../../lib/hooks/useTimeout'

const Confetti = ({ renderOverlay = true }: { renderOverlay?: boolean }) => {
  const [initialized, setInitialized] = useState(false)
  const [isRunning, setRunning] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  useTimeout(() => {
    setRunning(true)
    setInitialized(true)
  }, 1000)

  if (shouldReduceMotion) {
    return null
  }

  if (!isRunning) {
    if (!initialized || !renderOverlay) {
      return null
    }

    return (
      <button
        {...plainButtonRule}
        onClick={() => setRunning(true)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'transparent',
          cursor: 'pointer',
        }}
      >
        <p
          aria-hidden
          style={{
            position: 'absolute',
            left: -10000,
            top: 'auto',
            width: 1,
            height: 1,
            overflow: 'hidden',
          }}
        >
          Ich möchte mehr Konfetti!
        </p>
      </button>
    )
  }

  return null
  // <ReactConfetti
  //   run={isRunning}
  //   recycle={false}
  //   numberOfPieces={800}
  //   tweenDuration={10000}
  //   onConfettiComplete={() => setRunning(false)}
  //   style={{ overflow: 'hidden', width: '100%' }}
  // />
}

export default Confetti
