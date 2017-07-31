import { Placeholder } from 'slate'
import { css } from 'glamor'
import * as Styleguide from '@project-r/styleguide'
import createRule from '../utils/createRule'

export const P = createRule('block', 'p', ({ children }) =>
  <Styleguide.P>
    {children}
  </Styleguide.P>
)

export const H1 = createRule(
  'block',
  'h1',
  ({ children }) =>
    <Styleguide.H1>
      {children}
    </Styleguide.H1>
)

export const H2 = createRule(
  'block',
  'h2',
  ({ children }) =>
    <Styleguide.H2>
      {children}
    </Styleguide.H2>
)

export const H3 = createRule(
  'block',
  'h3',
  ({ children }) =>
    <Styleguide.H3>
      {children}
    </Styleguide.H3>
)

export const Lead = createRule(
  'block',
  'lead',
  ({ children }) =>
    <Styleguide.Lead>
      {children}
    </Styleguide.Lead>
)

export const Label = createRule(
  'block',
  'label',
  ({ children }) =>
    <Styleguide.Label>
      {children}
    </Styleguide.Label>
)

export const Interaction = {
  P: createRule('block', 'interaction.p', ({ children }) =>
    <Styleguide.Interaction.P>
      {children}
    </Styleguide.Interaction.P>
  ),
  H1: createRule(
    'block',
    'interaction.h1',
    ({ children }) =>
      <Styleguide.Interaction.H1>
        {children}
      </Styleguide.Interaction.H1>
  ),
  H2: createRule(
    'block',
    'interaction.h2',
    ({ children }) =>
      <Styleguide.Interaction.H2>
        {children}
      </Styleguide.Interaction.H2>
  ),
  H3: createRule(
    'block',
    'interaction.h3',
    ({ children }) =>
      <Styleguide.Interaction.H3>
        {children}
      </Styleguide.Interaction.H3>
  )
}

const styles = {
  blockquote: {
    color: Styleguide.colors.text,
    fontSize: 21,
    lineHeight: '32px'
  },
  blockquoteText: {
    fontFamily: Styleguide.fontFamilies.serifRegular,
    ':before': {
      display: 'inline',
      content: '«'
    },
    ':after': {
      display: 'inline',
      content: '»'
    }
  }
}

export const Blockquote = createRule(
  'block',
  'blockquote',
  ({ children }) =>
    <blockquote {...css(styles.blockquote)}>
      <div {...css(styles.blockquoteText)}>
        {children}
      </div>
    </blockquote>
)

export const Image = createRule(
  'block',
  'image',
  ({ node }) => {
    const src = node.data.get('src')
    if (src) {
      return (
        <img
          style={{ width: '100%' }}
          src={node.data.get('src')}
        />
      )
    }
    return (
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: '100%',
            paddingBottom: '57%',
            backgroundColor: Styleguide.colors.divider
          }}
        />
      </div>
    )
  }
)

export const ImageCaption = createRule(
  'block',
  'imageCaption',
  ({ children, node, state }) =>
    <small style={{ position: 'relative' }}>
      <Placeholder
        firstOnly={false}
        parent={node}
        node={node}
        state={state}
        style={{
          position: 'relative',
          whiteSpace: 'nowrap',
          opacity: '.5'
        }}
      >
        Image caption...
      </Placeholder>
      {children}
    </small>
)

export const ImageSource = createRule(
  'block',
  'imageSource',
  ({ children, node, state }) => {
    return (
      <small>
        <em
          style={{
            position: 'relative'
          }}
        >
          <Placeholder
            firstOnly={false}
            parent={node}
            node={node}
            state={state}
            style={{
              position: 'relative',
              whiteSpace: 'nowrap',
              opacity: '.5'
            }}
          >
            Image source ...
          </Placeholder>
          {children}
        </em>
      </small>
    )
  }
)
