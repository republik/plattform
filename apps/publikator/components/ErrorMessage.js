import { errorToString } from '../lib/utils/errors'

import { Interaction, colors } from '@project-r/styleguide'

const { P } = Interaction

const ErrorMessage = ({ error }) => (
  <P style={{ color: 'var(--color-error)', margin: '20px 0' }}>
    {errorToString(error)}
  </P>
)

export default ErrorMessage
