import { errorToString } from '../lib/utils/errors'

import { Interaction } from '@project-r/styleguide'

const { P } = Interaction

const ErrorMessage = ({ error }) => (
  <P
    style={{
      color: 'var(--colors-error)',
      margin: '20px 0',
    }}
  >
    {errorToString(error)}
  </P>
)

export default ErrorMessage
