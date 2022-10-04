import { ElementConfigI } from '../../../../custom-types'

export const config: ElementConfigI = {
  attrs: {
    isVoid: true,
  },
  // TODO: this prop isn't needed anymore
  //  should be deleted in the BE too
  props: ['date'],
}
