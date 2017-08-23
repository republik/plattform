import { TitleButton } from './ui'
import { matchBlock } from '../../utils'
import { H1 } from '@project-r/styleguide'
import { TITLE } from './constants'

export const title = {
  match: matchBlock(TITLE),
  render: ({ children }) => <H1>{ children }</H1>
}

export {
  TITLE,
  TitleButton
}

export default {
  plugins: [
    {
      schema: {
        rules: [
          title
        ]
      }
    }
  ]
}
