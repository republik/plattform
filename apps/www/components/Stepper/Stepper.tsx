import { FC, ReactNode, Ref, useEffect, useMemo, useRef, useState } from 'react'
import scrollIntoView from 'scroll-into-view'
import { isDev } from '../../lib/constants'
import { HEADER_HEIGHT } from '../constants'
import Steps from './Steps'

export type StepProps = {
  /**
   * UI to render the steps & back-button
   */
  stepperControls: ReactNode
  /**
   * Callback to advance to the next step or fire the complete callback
   */
  onAdvance: () => void
  /**
   * Go back to the previous step if available
   */
  onBack: () => void
}

export type StepRenderFunc = (props: StepProps) => ReactNode

export type Step = {
  name: string
  content: StepRenderFunc | ReactNode
}

function isContentRenderFunc(value: Step['content']): value is StepRenderFunc {
  return typeof value === 'function'
}

type StepperProps = {
  steps?: Step[]
  customStepperUIPlacement?: boolean
  contentWrapperElement?: FC<{ ref: Ref<HTMLDivElement>; children?: ReactNode }>
  onComplete?: () => void
}

const Stepper = ({
  steps = [],
  onComplete,
  customStepperUIPlacement = false,
  contentWrapperElement: ContentWrapper = ({ children, ref }) => (
    <div ref={ref}>{children}</div>
  ),
}: StepperProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState<number>(0)

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      const nextUp = activeStep + 1
      setActiveStep(nextUp)
    } else if (onComplete) {
      onComplete()
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      const previous = activeStep - 1
      setActiveStep(previous)
    } else if (isDev) {
      console.warn('Attempting to go back on step 0')
    }
  }

  useEffect(() => {
    scrollIntoView(containerRef.current, {
      align: {
        topOffset: HEADER_HEIGHT * 1,
      },
    })
  }, [activeStep])

  const currentStep = useMemo(() => steps[activeStep], [steps, activeStep])

  const stepsUI = (
    <Steps
      currentStep={activeStep}
      stepCount={steps.length}
      setStep={(val) => {
        setActiveStep(val)
      }}
    />
  )

  return (
    <ContentWrapper ref={containerRef}>
      {currentStep?.content && (
        <>
          {isContentRenderFunc(currentStep.content)
            ? currentStep.content({
                stepperControls: stepsUI,
                onAdvance: handleNext,
                onBack: handleBack,
              })
            : currentStep.content}
        </>
      )}
      {!customStepperUIPlacement && stepsUI}
    </ContentWrapper>
  )
}

export default Stepper
