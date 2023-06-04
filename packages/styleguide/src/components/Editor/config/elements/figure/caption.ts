import { ElementConfigI } from '../../../custom-types'

export const config: ElementConfigI = {
  structure: [
    { type: ['text', 'memo', 'link'], repeat: true },
    { type: 'figureByline' },
    // TODO: end node could/should be added automatically
    // TODO: repeat ends nodes to prevent text deletion
    { type: 'text', end: true },
  ],
}
