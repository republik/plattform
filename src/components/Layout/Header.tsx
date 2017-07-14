import * as React from 'react'
import { css, StyleAttribute } from 'glamor'
import { compose } from 'redux'
import { createContainer, createTile } from './Grid'
import Me from '../Auth/Me'
import { R, H2, A, colors } from '@project-r/styleguide'
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
  width: '45px',
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
    <HeaderSection flex="0 0 55px">
      <span style={logoStyles}>
        <R />
      </span>
    </HeaderSection>
    <HeaderSection flex="0 0 90px">
      <H2>Admin</H2>
    </HeaderSection>
    <HeaderSection flex="1 1 auto">
      <nav>
        <Link route="users">
          <A style={navLinkStyles}>Users</A>
        </Link>
        <Link route="layout">
          <A style={navLinkStyles}>Layout</A>
        </Link>
      </nav>
    </HeaderSection>
    <HeaderSection flex="0 0 200px">
      <Me />
    </HeaderSection>
  </Header>
