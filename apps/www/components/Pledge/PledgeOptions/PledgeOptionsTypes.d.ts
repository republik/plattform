export type RewardType = {
  name: string
  __typename: string
  minPeriods: number
  maxPeriods: number
  defaultPeriods: number
}

export type SuggestionType = {
  id: string
  price: number
  label: string
  description: string
  userPrice: boolean
  minUserPrice?: number
  favorite?: boolean
  option?: OptionType
  userPriceFallback: boolean
}

export type OptionType = {
  id?: string
  optionGroup: string
  additionalPeriods: []
  reward: RewardType
  minAmount?: number
  maxAmount?: number
  defaultAmount?: number
  price?: number
  userPrice: boolean
  minUserPrice: number
  suggestions: SuggestionType[]
  membership?: {
    user: {
      isUserOfCurrentSession: boolean
    }
  }
}

export type PackageType = {
  name: string
  suggestedTotal?: number
  options: OptionType[]
}

export interface FieldSetValues extends Record<string, number> {
  price?: number
  customPrice?: number
  reason?: string
}
