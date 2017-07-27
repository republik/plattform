import { css } from 'glamor'
import * as Styleguide from '@project-r/styleguide'
import createRule from '../utils/createRule'

export const P = createRule('block', 'p', Styleguide.P)
export const H1 = createRule('block', 'h1', Styleguide.H1)
export const H2 = createRule('block', 'h2', Styleguide.H2)
export const H3 = createRule('block', 'h3', Styleguide.H3)
export const Lead = createRule(
  'block',
  'lead',
  Styleguide.Lead
)

export const Span = createRule(
  'block',
  'span',
  Styleguide.Span
)
export const Label = createRule(
  'block',
  'label',
  Styleguide.Label
)
export const Interaction = {
  P: createRule(
    'block',
    'interaction.p',
    Styleguide.Interaction.P
  ),
  H1: createRule(
    'block',
    'interaction.h1',
    Styleguide.Interaction.H1
  ),
  H2: createRule(
    'block',
    'interaction.h2',
    Styleguide.Interaction.H2
  ),
  H3: createRule(
    'block',
    'interaction.h3',
    Styleguide.Interaction.H3
  )
}

const quoteBlockStyle = css({
  color: Styleguide.colors.text,
  fontSize: 21,
  lineHeight: '32px'
})

const quoteTextStyle = css({
  fontFamily: Styleguide.fontFamilies.serifRegular,
  ':before': {
    display: 'inline',
    content: '«'
  },
  ':after': {
    display: 'inline',
    content: '»'
  }
})

export const Blockquote = createRule(
  'block',
  'blockquote',
  ({ children }) =>
    <blockquote {...quoteBlockStyle}>
      <div {...quoteTextStyle}>
        {children}
      </div>
    </blockquote>
)
