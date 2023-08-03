import compose from 'lodash/flowRight'
import HeaderComponent from './Header'
import { createTile, createContainer } from './Grid'

export const Body = compose(
  createTile(
    {
      flex: '1 1 auto',
    },
    {
      style: {
        width: '100vw',
        height: '100vh',
      },
    },
  ),
  createContainer({
    direction: 'column',
    justifyContent: 'stretch',
    wrap: 'nowrap',
  }),
)('div')

export const Header = HeaderComponent

export const Content = compose(
  createTile(
    {},
    {
      style: { overflowY: 'scroll', padding: 20 },
    },
  ),
)('div')

export const Footer = compose(
  createTile(
    {
      flex: '0 0 80px',
    },
    {
      style: {
        borderTop: `1px solid ${'var(--color-divider)'}`,
      },
    },
  ),
  createContainer({
    direction: 'row',
    justifyContent: 'stretch',
  }),
)('footer')
