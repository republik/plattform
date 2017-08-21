import { LeadButton } from './ui'
import { matchBlock, pluginFromRules } from '../../utils'
import { H1 } from '@project-r/styleguide'

export const LEAD = 'lead'

export const lead = {
  match: matchBlock(LEAD),
  render: ({ children }) => <H1>{ children }</H1>
}

export default {
  LeadButton,
  lead,
  plugins: [
    pluginFromRules([
      lead
    ])
  ]
}
