import React from 'react'

import { Label, Interaction } from '@project-r/styleguide'

import { countFormat } from '../lib/utils/format'

const safeTextLength = value =>
  value &&
  value.document &&
  value.document.text &&
  value.document.text.length

export default ({ value }) => (
  <Interaction.P>
    <Label>Anzahl Zeichen</Label>
    <br />
    {
      countFormat(safeTextLength(value) || 0)
    }
  </Interaction.P>
)
