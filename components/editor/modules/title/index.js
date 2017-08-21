import { TitleButton } from './ui'
import { matchBlock, pluginFromRules } from '../../utils'
import { H1 } from '@project-r/styleguide'

export const TITLE = 'title'

export const title = {
  match: matchBlock(TITLE),
  render: ({ children }) => <H1>{ children }</H1>
}

export default {
  TitleButton,
  title,
  plugins: [
    pluginFromRules([
      title
    ])
  ]
}
