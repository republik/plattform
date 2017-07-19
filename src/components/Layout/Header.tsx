import * as React from 'react'
import { css, StyleAttribute } from 'glamor'
import { compose } from 'redux'
import { createContainer, createTile } from './Grid'
import Me from '../Auth/Me'
import { R, Interaction, A, colors } from '@project-r/styleguide'
import routes from '../../routes'
const { Link } = routes

const Header = compose(
  createTile(
    {
      flex: '0 0 80px'
    },
    {
      style: {
        borderBottom: `1px solid ${colors.divider}`
      }
    }
  ),
  createContainer({
    direction: 'row',
    justifyContent: 'stretch'
  })
)('header')

const HeaderSection = compose(
  createTile(),
  createContainer({
    direction: 'column',
    justifyContent: 'center'
  })
)('div')

const logoStyles = {
  width: '50px',
  marginLeft: '5px',
  display: 'inline-block'
}

const navLinkStyles = {
  display: 'inline-block',
  marginRight: '12px',
  cursor: 'pointer'
}

export default ({ children, style, ...props }: any) =>
  <Header {...props}>
    <HeaderSection flex="0 0 70px">
      <span style={logoStyles}>
        <R />
      </span>
    </HeaderSection>
    <HeaderSection flex="1 1 auto">
      <Interaction.H2>Admin</Interaction.H2>
      <nav>
        <Link route="users">
          <A style={navLinkStyles}>Users</A>
        </Link>
        <Link route="payments">
          <A style={navLinkStyles}>Payments</A>
        </Link>
      </nav>
    </HeaderSection>
    <HeaderSection flex="0 0 200px">
      <Me />
    </HeaderSection>
  </Header>
