import { ElementConfigI } from '../../../../custom-types'
import { ListItem } from '../../../../../List'

export const config: ElementConfigI = {
  Component: {
    article: ListItem,
  },
  structure: [{ type: ['text', 'link'], repeat: true }],
  attrs: {
    formatText: true,
    isMain: true,
  },
}
