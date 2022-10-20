import { CustomElement } from '../custom-types'

export const isSlateElement = (value: any): value is CustomElement =>
  typeof value?.type === 'string' && value?.children?.length
