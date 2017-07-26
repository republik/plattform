import { css } from 'glamor'
import * as Styleguide from '@project-r/styleguide'
import { createBlockRule } from '../utils'

console.log(Styleguide)

export const P = createBlockRule('p', Styleguide.P)
export const H1 = createBlockRule('h1', Styleguide.H1)
export const H2 = createBlockRule('h2', Styleguide.H2)
export const H3 = createBlockRule('h3', Styleguide.H3)
export const Lead = createBlockRule('lead', Styleguide.Lead)
export const Span = createBlockRule('span', Styleguide.Span)
export const Label = createBlockRule(
  'label',
  Styleguide.Label
)
export const Interaction = {
  P: createBlockRule(
    'Interaction.p',
    Styleguide.Interaction.P
  ),
  H1: createBlockRule(
    'Interaction.h1',
    Styleguide.Interaction.H1
  ),
  H2: createBlockRule(
    'Interaction.h2',
    Styleguide.Interaction.H2
  ),
  H3: createBlockRule(
    'Interaction.h3',
    Styleguide.Interaction.H3
  )
}

const quoteStyle = css({
  ':before': {
    display: 'inline',
    content: '«'
  },
  ':after': {
    display: 'inline',
    content: '»'
  }
})

export const Blockquote = createBlockRule(
  'blockquote',
  props => <P {...{ ...quoteStyle, ...props }} />
)
