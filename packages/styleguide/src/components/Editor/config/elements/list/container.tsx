import { ElementConfigI, NodeTemplate } from '../../../custom-types'
import { UlIcon, OlIcon } from '../../../../Icons'

const structure: NodeTemplate[] = [
  { type: 'listItem', main: true, repeat: true },
]
// TODO: this prop can be deleted
//  this should be done together with slate tree migration in BE
//  otherwise phantom uncommitted changed will appear in publikator
const props = ['ordered']

export const ulConfig: ElementConfigI = {
  button: { icon: UlIcon },
  props,
  structure,
}

export const olConfig: ElementConfigI = {
  button: { icon: OlIcon },
  props,
  structure,
}
