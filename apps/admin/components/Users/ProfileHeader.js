import { Query } from '@apollo/client/react/components'
import { css } from 'glamor'
import { gql } from '@apollo/client'
import {
  colors,
  fontStyles,
  Loader,
  Interaction,
  A,
} from '@project-r/styleguide'
import Head from 'next/head'
import Link from 'next/link'

import { REPUBLIK_FRONTEND_URL } from '../../server/constants'

import { Section, displayDate } from '../Display/utils'

const styles = {
  header: css({
    position: 'sticky',
    top: -20,
    zIndex: 10,
    borderBottom: `1px solid ${colors.disabled}`,
  }),
  byline: css({
    ...fontStyles.sansSerifRegular16,
  }),
  portrait: css({
    float: 'left',
    height: '50px',
    marginRight: '10px',
  }),
  navLink: css({
    color: '#000',
    padding: '0 3px',
    textDecoration: 'none',
    '&[data-active="true"]': {
      textDecoration: 'underline',
    },
    marginRight: 5,
  }),
}

export const GET_PROFILE = gql`
  query user($id: String) {
    user(slug: $id) {
      id
      firstName
      lastName
      email
      phoneNumber
      username
      portrait(size: SMALL)
      activeMembership {
        type {
          name
        }
        overdue
        renew
      }
      isListed
      hasPublicProfile
      memberships {
        id
        periods {
          endDate
        }
      }
    }
  }
`

const getLastPeriod = (periods) =>
  periods?.reduce((accumulator, currentValue) => {
    return !accumulator || currentValue.endDate > accumulator.endDate
      ? currentValue
      : accumulator
  }, false)

const Subnav = ({ userId, section }) => (
  <div>
    <Link
      href={`/users/${userId}`}
      {...styles.navLink}
      data-active={section === 'index'}
    >
      Übersicht
    </Link>
    <Link
      href={{
        pathname: `/users/${userId}`,
        query: {
          section: 'sessions',
        },
      }}
      {...styles.navLink}
      data-active={section === 'sessions'}
    >
      Sessions
    </Link>
    <Link
      href={{
        pathname: `/users/${userId}`,
        query: {
          section: 'access-grants',
        },
      }}
      {...styles.navLink}
      data-active={section === 'access-grants'}
    >
      Access Grants
    </Link>
    <Link
      href={{
        pathname: `/users/${userId}`,
        query: {
          section: 'mailbox',
        },
      }}
      {...styles.navLink}
      data-active={section === 'mailbox'}
    >
      E-Mails
    </Link>
    <Link
      href={{
        pathname: `/users/${userId}`,
        query: {
          section: 'dialog',
        },
      }}
      {...styles.navLink}
      data-active={section === 'dialog'}
    >
      Dialog
    </Link>
  </div>
)

const ProfileHeader = ({ userId, section }) => {
  return (
    <Query query={GET_PROFILE} variables={{ id: userId }}>
      {({ loading, error, data }) => {
        const isInitialLoading = loading && !(data && data.user)
        return (
          <Loader
            loading={isInitialLoading}
            error={isInitialLoading && error}
            render={() => {
              const { user } = data
              const { activeMembership } = user
              const { memberships } = user
              const periods = memberships?.map((m) => m.periods).flat()
              const lastPeriod = getLastPeriod(periods)

              const publicProfile = user.hasPublicProfile
                ? 'öffentlich'
                : 'nicht öffentlich'
              const name = [user.firstName, user.lastName]
                .filter(Boolean)
                .join(' ')
              const byline = [
                user.email && name && (
                  <A key='mail' href={`mailto:${user.email}`}>
                    {user.email}
                  </A>
                ),
                user.phoneNumber && (
                  <A key='phone' href={`tel:${user.phoneNumber}`}>
                    {user.phoneNumber}
                  </A>
                ),
                <span key='profile'>
                  <A
                    key='profile-link'
                    href={`${REPUBLIK_FRONTEND_URL}/~${
                      user.username || user.id
                    }`}
                    target='_blank'
                  >
                    {user.username || 'Profil'}
                    {' ('}
                    {publicProfile}
                    {user.isListed && ', auf Community-Seite'})
                  </A>
                </span>,
              ]
                .filter(Boolean)
                .reduce((acc, v) => [...acc, ' | ', v], [])
                .slice(1)

              const membership = activeMembership ? (
                <span>
                  {' | '}
                  {activeMembership.type?.name}
                  {!activeMembership.renew && <>{' · '}gekündigt</>}
                  {!!activeMembership.overdue && !!activeMembership.renew && (
                    <>{' · '}überfällig</>
                  )}
                  {lastPeriod && (
                    <>
                      {' · '}bis {displayDate(lastPeriod.endDate)}
                    </>
                  )}
                </span>
              ) : (
                lastPeriod && (
                  <span>
                    {' | '}ehemalig{' · '}bis {displayDate(lastPeriod.endDate)}
                  </span>
                )
              )

              const pageTitle = [
                section !== 'index' ? `${section}:` : '',
                name ? `${name} (${user.email.split('@')[1]})` : user.email,
                '– Admin',
              ]
                .join(' ')
                .trim()

              return (
                <Section {...styles.header}>
                  <Head>
                    <title>{pageTitle}</title>
                  </Head>
                  <div style={{ clear: 'both', margin: '0 2px' }}>
                    {user.portrait && (
                      <img src={user.portrait} {...styles.portrait} />
                    )}
                    <Interaction.H3>{name || user.email}</Interaction.H3>
                    <div {...styles.byline}>
                      {byline}
                      {membership}
                    </div>
                  </div>
                  <div style={{ clear: 'both', margin: '10px 0' }}>
                    <Subnav userId={userId} section={section} />
                  </div>
                </Section>
              )
            }}
          />
        )
      }}
    </Query>
  )
}

export default ProfileHeader
