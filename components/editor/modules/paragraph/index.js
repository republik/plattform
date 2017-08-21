import { ParagraphButton } from './ui'
import { matchBlock, pluginFromRules } from '../../utils'
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
    pluginFromRules([
      paragraph
    ])
  ]
}
