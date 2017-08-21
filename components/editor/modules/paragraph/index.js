import { ParagraphButton } from './ui'
import { matchBlock, pluginFromRules } from '../../utils'
import { P } from '@project-r/styleguide'

export const PARAGRAPH = 'paragraph'

export const paragraph = {
  match: matchBlock(PARAGRAPH),
  render: ({ children }) => <P>{ children }</P>
}

export default {
  ParagraphButton,
  paragraph,
  plugins: [
    pluginFromRules([
      paragraph
    ])
  ]
}
