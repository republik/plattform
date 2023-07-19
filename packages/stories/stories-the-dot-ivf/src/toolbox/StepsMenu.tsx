import { css } from 'glamor'

import { useColorContext } from '../__styleguide/components/Colors/ColorContext'

import { StepIndicator } from './StepIndicator'

export const StepsMenu = ({
  stepIds,
  currentStep,
}: {
  stepIds: string[]
  currentStep: number
}) => {
  // TODO: migrate color ctxt out of styleguide
  const [colorScheme] = useColorContext()

  return (
    <div
      {...styles.container}
      {...colorScheme.set('backgroundColor', 'default')}
      style={{ opacity: currentStep ? 1 : 0 }}
    >
      {stepIds.map((stepId, idx) => (
        <StepIndicator
          key={stepId}
          mini
          step={idx + 1}
          currentStep={currentStep}
        />
      ))}
    </div>
  )
}

const styles = {
  container: css({
    left: 10,
    alignSelf: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    opacity: 0,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    gap: 0,
  }),
}
