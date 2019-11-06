import React from 'react'
import { errorToString } from '../lib/utils/errors'

import { Interaction, colors } from '@project-r/styleguide'

const { P } = Interaction

export default ({ error }) => (
  <P style={{ color: colors.error, margin: '20px 0' }}>
    {errorToString(error)}
  </P>
)
