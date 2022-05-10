import React, { Fragment } from 'react'
import { markdown, ColorSpecimen, CodeSpecimen } from '@catalog/core'
import colorDefinitions from './colors'
import { css } from 'glamor'

export default () => (
  <>
    {markdown`

We have two color scheme, \`light\` and \`dark\`.

Simple usage example of the color context:

    ${(
      <CodeSpecimen lang='js'>
        {`
import { useColorContext } from '@project-r/styleguide'

const Component = ({ children }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...colorScheme.set('backgroundColor', 'default')}
      {...colorScheme.set('color', 'text')}
    >
      {children}
    </div>
  )
})
      `.trim()}
      </CodeSpecimen>
    )}

[Development Guide](/dev/colors)
  `}
    {['light', 'dark'].map((colorSchemeKey) => {
      const colors = colorDefinitions[colorSchemeKey]
      return (
        <div
          key={colorSchemeKey}
          {...css({
            color: colors.text,
            backgroundColor: colors.default,
            // headlines & paragraphs
            '& > div > *': {
              color: `${colors.text} !important`,
            },
            // ColorSpecimen text block
            '& .css-1uvsawy': {
              color: `${colors.text} !important`,
              backgroundColor: `${colors.hover} !important`,
            },
          })}
        >
          {markdown`
# ${colorSchemeKey[0].toUpperCase()}${colorSchemeKey.slice(1)}

${(
  <Fragment>
    <ColorSpecimen span={3} name='primary' value={colors.primary} />
    <ColorSpecimen span={2} name='primaryHover' value={colors.primaryHover} />
    <ColorSpecimen span={1} name='error' value={colors.error} />

    <ColorSpecimen span={3} name='text' value={colors.text} />
    <ColorSpecimen span={2} name='textSoft' value={colors.textSoft} />
    <ColorSpecimen span={1} name='disabled' value={colors.disabled} />

    <ColorSpecimen span={2} name='default' value={colors.default} />
    <ColorSpecimen span={1} name='overlay' value={colors.overlay} />
    <ColorSpecimen span={1} name='divider' value={colors.divider} />
    <ColorSpecimen span={1} name='hover' value={colors.hover} />
    <ColorSpecimen span={1} name='alert' value={colors.alert} />

    <ColorSpecimen
      span={2}
      name='defaultInverted'
      value={colors.defaultInverted}
    />
    <ColorSpecimen
      span={1}
      name='overlayInverted'
      value={colors.overlayInverted}
    />
    <ColorSpecimen
      span={1}
      name='dividerInverted'
      value={colors.dividerInverted}
    />
  </Fragment>
)}

## Sections

${(
  <Fragment>
    <ColorSpecimen
      span={2}
      name='accentColorBriefing'
      value={colors.accentColorBriefing}
    />
    <ColorSpecimen
      span={2}
      name='accentColorInteraction'
      value={colors.accentColorInteraction}
    />
    <ColorSpecimen
      span={2}
      name='accentColorOppinion'
      value={colors.accentColorOppinion}
    />
    <ColorSpecimen
      span={2}
      name='accentColorFormats'
      value={colors.accentColorFormats}
    />
    <ColorSpecimen
      span={2}
      name='accentColorMeta'
      value={colors.accentColorMeta}
    />
    <ColorSpecimen
      span={2}
      name='accentColorAudio'
      value={colors.accentColorAudio}
    />
  </Fragment>
)}

## Charts

Most charts will use sequential colors, e.g. bars all in the first sequential color and one highlight in the second. Opposite colors are used for diverging ranges, with an optional neutral color in the middle.

${[100, 80, 60].map((intensity) => (
  <ColorSpecimen
    span={1}
    name={`sequential${intensity}`}
    value={colors[`sequential${intensity}`]}
  />
))}
${[60, 80, 100].map((intensity) => (
  <ColorSpecimen
    span={1}
    name={`opposite${intensity}`}
    value={colors[`opposite${intensity}`]}
  />
))}
${(<ColorSpecimen span={1} name='neutral' value={colors.neutral} />)}

### Discrete

For categories, e.g. 10 lines in a chart, each representing a country.

${colors.discrete.map((c, i) => (
  <ColorSpecimen span={1} name={`discrete.${i}`} value={c} />
))}

`}
        </div>
      )
    })}
  </>
)
