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

    <ColorSpecimen span={4} name='text' value={colors.text} />
    <ColorSpecimen span={2} name='lightText' value={colors.lightText} />

    <ColorSpecimen span={1} name='error' value={colors.error} />
    <ColorSpecimen span={1} name='online' value={colors.online} />

    <ColorSpecimen span={1} name='editorial' value={colors.editorial} />
    <ColorSpecimen span={1} name='meta' value={colors.meta} />
    <ColorSpecimen span={1} name='social' value={colors.social} />

    <h2>Charts</h2>
    <p>Most charts will use sequential colors, e.g. bars all in the frist sequential color and one highlight in the second. Opposite colors are used for diverging ranges, with an optional neutral color in the middle.</p>
    {colors.sequential3.map((c, i) =>
      <ColorSpecimen span={1} name={`sequential.${i}`} value={c} />)}
    {[].concat(colors.opposite3).reverse().map((c, i) =>
      <ColorSpecimen span={1} name={`opposite.${2 - i}`} value={c} />)}
    <ColorSpecimen span={1} name='neutral' value={colors.neutral} />
    <br />
    <h3>Discrete</h3>
    <p>For categories, e.g. 10 lines in a chart, each representing a country.</p>
    {colors.discrete.map((c, i) =>
      <ColorSpecimen span={1} name={`discrete.${i}`} value={c} />)}
  </Page>
)
