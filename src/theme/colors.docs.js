import React from 'react'
import {Page, ColorSpecimen} from 'catalog'
import * as colors from './colors'

export default () => (
  <Page>
    <ColorSpecimen span={4} name='Primär Farbe' value={colors.primary} />
    <ColorSpecimen span={1} name='Hover' value={colors.primaryHover} />
    <ColorSpecimen span={1} name='Deaktiviert' value={colors.primaryDisabled} />

    <ColorSpecimen span={4} name='Aktiv Farbe' value={colors.active} />
    <ColorSpecimen span={1} name='Fehler' value={colors.error} />
    <ColorSpecimen span={1} name='Fehler BG' value={colors.errorBg} />

    <ColorSpecimen span={2} name='Text' value={colors.text} />
    <ColorSpecimen span={2} name='Label' value={colors.textLabel} />
    <ColorSpecimen span={1} name='Border' value={colors.border} />
    <ColorSpecimen span={1} name='Border Focus' value={colors.borderFocus} />
  </Page>
)