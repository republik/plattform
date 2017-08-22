import { ParagraphButton } from './ui'
import { matchBlock } from '../../utils'
import { P } from '@project-r/styleguide'
import { PARAGRAPH } from './constants'

export const paragraph = {
  match: matchBlock(PARAGRAPH),
  render: ({ children }) => <P>{ children }</P>
}

export {
  PARAGRAPH,
  ParagraphButton
}

export default {
  plugins: [
    {
      schema: {
        rules: [
          paragraph
        ]
      }
    }
  ]
}
