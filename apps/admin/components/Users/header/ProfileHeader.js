'use client'

import { gql } from '@apollo/client'
import { Query } from '@apollo/client/react/components'
import {
  A,
  colors,
  fontStyles,
  Interaction,
  Loader,
} from '@project-r/styleguide'
import { css } from '@republik/theme/css'
import Head from 'next/head'

import { REPUBLIK_FRONTEND_URL } from '@/server/constants'

import { displayDate, Section } from '@/components/Display/utils'
import { Avatar } from './avatar'

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
              const { activeMembership, memberships = [] } = user || {}
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
              return (
                <Section className={styles.header}>
                  <Head>
                    <title>
                      {section !== 'index' ? `${section}: ` : ''}
                      {name
                        ? `${name} (${user.email.split('@')[1]})`
                        : user.email}{' '}
                      – Admin
                    </title>
                  </Head>
                  <div style={{ clear: 'both', margin: '0 2px' }}>
                    <Avatar {...user} />
                    <Interaction.H3>{name || user.email}</Interaction.H3>
                    <div className={styles.byline}>
                      {byline}
                      {membership}
                    </div>
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
