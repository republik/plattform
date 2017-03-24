import React from 'react'
import {Page, ColorSpecimen} from 'catalog'
import * as colors from './colors'

export default () => (
  <Page>
    <ColorSpecimen span={3} name='Primär Farbe' value={colors.primary} />
    <ColorSpecimen span={2} name='Secondär' value={colors.secondary} />
    <ColorSpecimen span={1} name='Deaktiviert' value={colors.disabled} />

    <ColorSpecimen span={5} name='Text' value={colors.text} />
    <ColorSpecimen span={1} name='Fehler' value={colors.error} />
  </Page>
)