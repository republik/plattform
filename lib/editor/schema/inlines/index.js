import createRule, {
  DEFAULT_PROPS
} from '../utils/createRule'
import * as Styleguide from '@project-r/styleguide'

export const Span = createRule(
  'inline',
  'span',
  Styleguide.Span
)

export const A = createRule(
  'inline',
  'a',
  ({ node, children }) => {
    const { data, attributes } = node
    return (
      <Styleguide.A {...attributes} href={data.get('href')}>
        {children}
      </Styleguide.A>
    )
  },
  DEFAULT_PROPS.concat('node')
)
