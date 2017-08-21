import { LinkButton, LinkForm } from './ui'
import { matchInline, pluginFromRules } from '../../utils'
import { A } from '@project-r/styleguide'
import { LINK } from './constants'

export const link = {
  match: matchInline(LINK),
  render: ({ children, node }) => (
    <A
      href={node.getIn(['data', 'href'])}
    >{ children }</A>
  )
}

export {
  LINK,
  LinkForm,
  LinkButton
}

export default {
  plugins: [
    pluginFromRules([
      link
    ])
  ]
}
