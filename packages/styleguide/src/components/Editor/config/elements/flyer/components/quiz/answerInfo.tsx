import { ElementConfigI } from '../../../../../custom-types'

export const config: ElementConfigI = {
  structure: [{ type: ['quizAnswerInfoP'], repeat: true }],
  attrs: {
    blockUi: {
      style: {
        display: 'none',
      },
    },
  },
}
