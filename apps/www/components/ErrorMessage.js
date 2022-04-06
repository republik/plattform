import { errorToString } from '../lib/utils/errors'

import { useColorContext, Interaction, Label } from '@project-r/styleguide'

const { P } = Interaction

export const ErrorContainer = ({ children, style }) => {
  const [colorScheme] = useColorContext()
  return (
    <div {...colorScheme.set('color', 'error')} style={style}>
      {children}
    </div>
  )
}

const ErrorMessage = ({ error, style, children }) => {
  const [colorScheme] = useColorContext()
  return (
    <P style={{ margin: '20px 0', ...style }}>
      <span {...colorScheme.set('color', 'error')}>
        {error && errorToString(error)}
        {children}
      </span>
    </P>
  )
}

export const ErrorLabel = ({ error, children }) => {
  const [colorScheme] = useColorContext()
  return (
    <Label>
      <span {...colorScheme.set('color', 'error')}>
        {error && errorToString(error)}
        {children}
      </span>
    </Label>
  )
}

export default ErrorMessage
