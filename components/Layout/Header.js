import React from 'react'
import { css } from 'glamor'
import { compose } from 'react-apollo'
import {
  createContainer,
  createTile
} from './Grid'
import Me from '../Auth/Me'
import {
  BrandMark,
  Interaction,
  colors
} from '@project-r/styleguide'
import routes from '../../server/routes'

const { Link } = routes

const link = css({
  textDecoration: 'none',
  color: colors.primary,
  ':visited': {
    color: colors.primary
  },
  ':hover': {
    color: colors.secondary
  }
})

const Header = compose(
  createTile(
    {
      flex: '0 0 80px'
    },
    {
      style: {
        borderBottom: `1px solid ${
          colors.divider
        }`
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
  marginLeft: '15px',
  display: 'inline-block'
}

const navLinkStyles = {
  display: 'inline-block',
  marginRight: '12px',
  cursor: 'pointer'
}

export default ({ ...props }) => {
  const searchParams = props.search ? { search: props.search } : {}
  return (
    <Header {...props}>
      <HeaderSection flex="0 0 85px">
        <span style={logoStyles}>
          <BrandMark />
        </span>
      </HeaderSection>
      <HeaderSection flex="1 1 auto">
        <Interaction.H2>Admin</Interaction.H2>
        <nav>
          <Link route="users" params={searchParams}>
            <a
              className={`${link}`}
              style={navLinkStyles}
            >
              Users
            </a>
          </Link>
          <Link route="maillog" params={searchParams}>
            <a
              className={`${link}`}
              style={navLinkStyles}
            >
              E-Mails
            </a>
          </Link>
          <Link route="payments" params={searchParams}>
            <a
              className={`${link}`}
              style={navLinkStyles}
            >
              Payments
            </a>
          </Link>
          <Link route="postfinance-payments" params={searchParams}>
            <a
              className={`${link}`}
              style={navLinkStyles}
            >
              Postfinance Payments
            </a>
          </Link>
          <Link route="merge-users">
            <a
              className={`${link}`}
              style={navLinkStyles}
            >
              Users zusammenführen
            </a>
          </Link>
        </nav>
      </HeaderSection>
      <HeaderSection flex="0 0 200px">
        <Me />
      </HeaderSection>
    </Header>
  )
}
