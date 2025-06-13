import { css } from 'glamor'
import { CSSProperties, Dispatch, SetStateAction, useMemo, useRef } from 'react'
import {
  plainButtonRule,
  useColorContext,
  mediaQueries,
} from '@project-r/styleguide'
import { motion } from 'motion/react'

function getIndeciesArray(value: number): number[] {
  if (value < 1) {
    return []
  } else {
    const arr = []
    for (let i = 0; i < value; i++) arr.push(i)
    return arr
  }
}

type StepProp = {
  step: number
  isActive?: boolean
  isLocked?: boolean
  style?: CSSProperties
}

const Step = ({ step, isActive, isLocked, style }: StepProp) => {
  const [colorScheme] = useColorContext()

  const attributes = {
    ...colorScheme.set(
      'backgroundColor',
      isActive ? 'text' : isLocked ? 'divider' : 'textSoft',
    ),
    ...styles.step,
    className: isActive ? 'active' : undefined,
  }

  return <motion.li {...attributes} style={style} key={step} />
}

type StepsProps = {
  stepCount: number
  currentStep?: number
  setStep?: Dispatch<SetStateAction<number>>
}

const Steps = ({ stepCount, currentStep = 0, setStep }: StepsProps) => {
  const stepsWrapperRef = useRef<HTMLOListElement>(null)
  const steps = useMemo(() => getIndeciesArray(stepCount), [stepCount])

  return (
    <div {...styles.wrapper}>
      <div style={{ alignSelf: 'start' }}>
        {setStep && currentStep > 0 && (
          <button
            {...plainButtonRule}
            {...styles.backButton}
            onClick={() => setStep(currentStep - 1)}
          >
            zurück
          </button>
        )}
      </div>
      <ol ref={stepsWrapperRef} {...styles.steps}>
        {steps.map((step) => (
          <Step key={step} step={step} isActive={step === currentStep} />
        ))}
      </ol>
      <div>{currentStep > 0 && <span />}</div>
    </div>
  )
}

export default Steps

const styles = {
  wrapper: css({
    alignSelf: 'stretch',
    display: 'grid',
    gridTemplateColumns: '1fr 4fr 1fr',
    gridAutoRows: 'auto',
    padding: '0.5rem 0',
    [mediaQueries.mUp]: {
      padding: '1rem 0',
    },
  }),
  steps: css({
    display: 'inline-flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.75rem',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    height: '1.25rem',
  }),
  step: css({
    display: 'inline-block',
    height: '0.35rem',
    width: '1.5rem',
    [mediaQueries.mUp]: {
      height: '0.5rem',
      width: '2rem',
    },
    borderRadius: 8,
    opacity: 0.5,
    '&.active': {
      opacity: 1,
    },
    '[disabled]': {
      cursor: 'default',
    },
  }),
  backButton: css({
    userSelect: 'none',
  }),
}
