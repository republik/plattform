import { ReactNode } from 'react'

export enum SliderStep {
  'minimum',
  'belowStandard',
  'standard',
  'investmentLow',
  'maximum',
}

export type SliderValue = {
  position: number
  step: SliderStep
  value: number
  tick?: boolean
  isDefault?: boolean
}

export const SLIDER_VALUE_MINIMUM = 120
export const SLIDER_VALUE_AVERAGE = 240

export const SLIDER_VALUES: SliderValue[] = [
  { step: SliderStep.minimum, value: SLIDER_VALUE_MINIMUM, tick: true },

  { step: SliderStep.belowStandard, value: 130 },
  { step: SliderStep.belowStandard, value: 140 },
  { step: SliderStep.belowStandard, value: 150 },
  { step: SliderStep.belowStandard, value: 160 },
  { step: SliderStep.belowStandard, value: 170 },
  { step: SliderStep.belowStandard, value: 180 },
  { step: SliderStep.belowStandard, value: 190 },
  { step: SliderStep.belowStandard, value: 200 },
  { step: SliderStep.belowStandard, value: 210 },
  { step: SliderStep.belowStandard, value: 220 },
  { step: SliderStep.belowStandard, value: 230 },

  { step: SliderStep.standard, value: 240, tick: true, isDefault: true },

  { step: SliderStep.investmentLow, value: 260 },
  { step: SliderStep.investmentLow, value: 280 },
  { step: SliderStep.investmentLow, value: 300 },
  { step: SliderStep.investmentLow, value: 320 },
  { step: SliderStep.investmentLow, value: 340 },
  { step: SliderStep.investmentLow, value: 360 },
  { step: SliderStep.investmentLow, value: 380 },
  { step: SliderStep.investmentLow, value: 400 },
  { step: SliderStep.investmentLow, value: 420 },
  { step: SliderStep.investmentLow, value: 440 },
  { step: SliderStep.investmentLow, value: 460 },

  { step: SliderStep.maximum, value: 480, tick: true },
].map((value, position) => {
  return { position, ...value }
})

export const SLIDER_TRANSITION = {
  type: 'spring',
  bounce: 0.4,
  duration: 0.5,
}
