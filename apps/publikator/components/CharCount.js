import React from 'react'

import { Label, Interaction } from '@project-r/styleguide'

import { countFormat } from '../lib/utils/format'
import withT from '../lib/withT'

const safeTextLength = value =>
  value && value.document && value.document.text && value.document.text.length

export default withT(({ value, t }) => (
  <Interaction.P>
    <Label>{t('ui/sidebar/info/numCharacters')}</Label>
    <br />
    {countFormat(safeTextLength(value) || 0)}
  </Interaction.P>
))
