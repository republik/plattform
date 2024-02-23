import { SLIDER_VALUES, SliderValue, SliderStep } from './config'

export type { SliderValue } from './config'

export const getSliderStepAtPosition = (pos: number): SliderValue => {
  return SLIDER_VALUES[pos] ?? getDefaultSliderStep()
}

export const getSliderStepForValue = (value: number): SliderValue => {
  return SLIDER_VALUES.find((v) => v.value === value) ?? getDefaultSliderStep()
}

export const getSliderStep = (key: SliderStep): SliderValue => {
  return SLIDER_VALUES.find((v) => v.step === key) ?? getDefaultSliderStep()
}

export const getFirstSliderStep = (): SliderValue => {
  return SLIDER_VALUES[0]
}

export const getLastSliderStep = (): SliderValue => {
  return SLIDER_VALUES[SLIDER_VALUES.length - 1]
}

export const getNextSliderStep = (value: SliderValue): SliderValue => {
  return (
    SLIDER_VALUES.find((v) => v.position === value.position + 1) ??
    getLastSliderStep()
  )
}

export const getPreviousSliderStep = (value: SliderValue): SliderValue => {
  return (
    SLIDER_VALUES.find((v) => v.position === value.position - 1) ??
    getFirstSliderStep()
  )
}

export const getDefaultSliderStep = (): SliderValue => {
  return SLIDER_VALUES.find((v) => v.isDefault) ?? SLIDER_VALUES[0]
}
