import { SLIDER_STEPS, SLIDER_STEP_VALUES } from '../constants'

export type SliderStep = {
  pos: number
  step: number
  value: number
  label: string
  text: string
}

export const getSliderStepAtPosition = (pos: number): SliderStep => {
  const val = SLIDER_STEP_VALUES[pos] ?? SLIDER_STEP_VALUES[0]

  const step = SLIDER_STEPS[val.step]

  return {
    pos,
    step: val.step,
    value: val.value,
    label: step.label,
    text: step.text,
  }
}

export const getSliderStep = (index: number): SliderStep => {
  const pos = SLIDER_STEP_VALUES.findIndex((v) => v.step === index) ?? 0

  const val = SLIDER_STEP_VALUES[pos]

  const step = SLIDER_STEPS[val.step]

  return {
    pos,
    step: val.step,
    value: val.value,
    label: step.label,
    text: step.text,
  }
}
