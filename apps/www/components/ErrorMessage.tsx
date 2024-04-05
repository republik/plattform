import { errorToString } from '../lib/utils/errors'

import { useColorContext, Interaction, Label } from '@project-r/styleguide'

const { P } = Interaction

interface ErrorContainerProps {
  children: React.ReactNode
  style?: React.CSSProperties
}

export function ErrorContainer({ children, style }: ErrorContainerProps) {
  const [colorScheme] = useColorContext()
  return (
    <div {...colorScheme.set('color', 'error')} style={style}>
      {children}
    </div>
  )
}

interface ErrorMessageProps {
  children?: React.ReactNode
  error: Error
  style?: React.CSSProperties
}

function ErrorMessage({ error, style, children }: ErrorMessageProps) {
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

interface ErrorLabelProps {
  children?: React.ReactNode
  error: Error
}

export function ErrorLabel({ error, children }: ErrorLabelProps) {
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
