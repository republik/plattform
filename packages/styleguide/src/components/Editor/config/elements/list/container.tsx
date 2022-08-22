import { ElementConfigI, NodeTemplate } from '../../../custom-types'
import { UlIcon, OlIcon } from '../../../../Icons'

const structure: NodeTemplate[] = [
  { type: 'listItem', main: true, repeat: true },
]
const props = ['ordered']

export const ulConfig: ElementConfigI = {
  button: { icon: UlIcon },
  defaultProps: {
    ordered: false,
  },
  props,
  structure,
}

export const olConfig: ElementConfigI = {
  button: { icon: OlIcon },
  defaultProps: {
    ordered: true,
  },
  props,
  structure,
}
