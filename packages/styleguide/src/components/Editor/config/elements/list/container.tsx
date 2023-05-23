import { IconOrderedList, IconUnorderedList } from '@republik/icons'
import { ElementConfigI } from '../../../custom-types'

// TODO: 'ordered' prop can be deleted
//  this should be done together with slate tree migration in BE
//  otherwise phantom uncommitted changed will appear in Publikator
const baseConfig: Partial<ElementConfigI> = {
  structure: [{ type: 'listItem', main: true, repeat: true }],
  props: ['ordered'],
  attrs: {
    blockUi: {
      style: {
        top: 4,
      },
    },
  },
}

export const ulConfig: ElementConfigI = {
  button: { icon: IconUnorderedList },
  ...baseConfig,
}

export const olConfig: ElementConfigI = {
  button: { icon: IconOrderedList },
  ...baseConfig,
}
