import { LeadButton } from './ui'
import { matchBlock } from '../../utils'
import { Lead } from '@project-r/styleguide'
import { LEAD } from './constants'

export const lead = {
  match: matchBlock(LEAD),
  render: ({ children }) => <Lead>{ children }</Lead>
}

export {
  LEAD,
  LeadButton
}

export default {
  plugins: [
    {
      schema: {
        rules: [
          lead
        ]
      }
    }
  ]
}
