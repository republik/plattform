import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { createContainer, createTile } from './Grid'
import Me from '../Auth/Me'
import { BrandMark, Interaction, colors, P } from '@project-r/styleguide'
import Link from 'next/link'
import withMe from '../../lib/withMe'
import { checkRoles } from '../Auth/withAuthorization'

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

const hideOnPrint = css({
  '@media print': {
    display: 'none',
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

const HeaderComponent = ({ me, ...props }) => {
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
        <nav {...hideOnPrint}>
          <Link
            href={{
              pathname: '/users',
              query: searchParams,
            }}
          >
            <a className={`${link}`} style={navLinkStyles}>
              Users
            </a>
          </Link>
          <Link
            href={{
              pathname: '/mailbox',
              query: searchParams,
            }}
          >
            <a className={`${link}`} style={navLinkStyles}>
              E-Mails
            </a>
          </Link>
          <Link
            href={{
              pathname: '/payments',
              query: searchParams,
            }}
          >
            <a className={`${link}`} style={navLinkStyles}>
              Payments
            </a>
          </Link>
          <Link
            href={{
              pathname: '/postfinance-payments',
              query: searchParams,
            }}
          >
            <a className={`${link}`} style={navLinkStyles}>
              Postfinance
            </a>
          </Link>
          {checkRoles(me, ['accountant']) && (
            <Link
              href={{
                pathname: '/reports',
                query: searchParams,
              }}
            >
              <a className={`${link}`} style={navLinkStyles}>
                Reports
              </a>
            </Link>
          )}
          <Link href='/merge-users'>
            <a className={`${link}`} style={navLinkStyles}>
              Users zusammenführen
            </a>
          </Link>
        </nav>
      </HeaderSection>
      <HeaderSection flex='0 0 200px'>
        <div {...hideOnPrint}>
          <Me />
        </div>
      </HeaderSection>
    </Header>
  )
}

export default withMe(HeaderComponent)
