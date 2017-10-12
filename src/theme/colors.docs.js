import React from 'react'
import {Page, ColorSpecimen, CodeSpecimen} from 'catalog'
import colors from './colors'

export default () => (
  <Page>
    <CodeSpecimen lang='js'>
      {`import {colors} from '@project-r/styleguide'`}
    </CodeSpecimen>
    <ColorSpecimen span={3} name='primary' value={colors.primary} />
    <ColorSpecimen span={2} name='secondary' value={colors.secondary} />
    <ColorSpecimen span={1} name='disabled' value={colors.disabled} />
    <ColorSpecimen span={3} name='primaryBg' value={colors.primaryBg} />
    <ColorSpecimen span={2} name='secondaryBg' value={colors.secondaryBg} />
    <ColorSpecimen span={1} name='divider' value={colors.divider} />

    <ColorSpecimen span={3} name='text' value={colors.text} />
    <ColorSpecimen span={2} name='lightText' value={colors.lightText} />
    <ColorSpecimen span={1} name='whiteSmoke' value={colors.whiteSmoke} />

    <ColorSpecimen span={1} name='error' value={colors.error} />
    <ColorSpecimen span={1} name='ocker' value={colors.ocker} />
    <ColorSpecimen span={1} name='green' value={colors.green} />
  </Page>
)
