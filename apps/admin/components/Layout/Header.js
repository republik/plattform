import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { createContainer, createTile } from './Grid'
import Me from '../Auth/Me'
import { BrandMark, Interaction, colors } from '@project-r/styleguide'
import Link from 'next/link'

const link = css({
  textDecoration: 'none',
  color: colors.primary,
  ':visited': {
    color: colors.primary,
  },
  ':hover': {
    color: colors.secondary,
  },
})

const Header = compose(
  createTile(
    {
      flex: '0 0 80px',
    },
    {
      style: {
        borderBottom: `1px solid ${colors.divider}`,
      },
    },
  ),
  createContainer({
    direction: 'row',
    justifyContent: 'stretch',
  }),
)('header')

const HeaderSection = compose(
  createTile(),
  createContainer({
    direction: 'column',
    justifyContent: 'center',
  }),
)('div')

const logoStyles = {
  width: '50px',
  marginLeft: '15px',
  display: 'inline-block',
}

const navLinkStyles = {
  display: 'inline-block',
  marginRight: '12px',
  cursor: 'pointer',
}

const HeaderComponent = ({ ...props }) => {
  const searchParams = props.search ? { search: props.search } : {}

  return (
    <Header {...props}>
      <HeaderSection flex='0 0 85px'>
        <span style={logoStyles}>
          <BrandMark />
        </span>
      </HeaderSection>
      <HeaderSection flex='1 1 auto'>
        <Interaction.H2>Admin</Interaction.H2>
        <nav>
          <Link
            href={{
              pathname: '/users',
              query: searchParams,
            }}
            className={`${link}`}
            style={navLinkStyles}
          >
            Users
          </Link>
          <Link
            href={{
              pathname: '/mailbox',
              query: searchParams,
            }}
            className={`${link}`}
            style={navLinkStyles}
          >
            E-Mails
          </Link>
          <Link
            href={{
              pathname: '/payments',
              query: searchParams,
            }}
            className={`${link}`}
            style={navLinkStyles}
          >
            Payments
          </Link>
          <Link
            href={{
              pathname: '/postfinance-payments',
              query: searchParams,
            }}
            className={`${link}`}
            style={navLinkStyles}
          >
            Postfinance Payments
          </Link>
          <Link href='/merge-users' className={`${link}`} style={navLinkStyles}>
            Users zusammenführen
          </Link>
        </nav>
      </HeaderSection>
      <HeaderSection flex='0 0 200px'>
        <Me />
      </HeaderSection>
    </Header>
  )
}

export default HeaderComponent
