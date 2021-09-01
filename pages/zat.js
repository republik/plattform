import React, { useState, useEffect } from 'react'
import { Query, compose } from 'react-apollo'
import { withRouter } from 'next/router'
import gql from 'graphql-tag'
import { Label, A, Loader, fontStyles } from '@project-r/styleguide'

import { enforceAuthorization } from '../components/Auth/withAuthorization'
import App from '../components/App'
import { Body } from '../components/Layout'
import withT from '../lib/withT'

import ZafClient from '../lib/zat/client'

import { displayDate, DT, DD } from '../components/Display/utils'
import { css, merge } from 'glamor'

const styles = {
  hint: css({
    borderBottom: '1px solid #DDD',
    marginBottom: '10px',
    paddingBottom: '10px',
    ...fontStyles.sansSerifRegular14
  }),
  item: css({
    borderBottom: '1px solid #DDD',
    marginBottom: '10px',
    paddingBottom: '10px'
  }),
  title: css({
    marginTop: '10px',
    ...fontStyles.sansSerif14
  })
}

export const GET_ADMIN_USERS = gql`
  query zatAdminUsers($search: String!) {
    adminUsers(search: $search, limit: 5) {
      count
      items {
        id
        email
        name
        activeMembership {
          type {
            name
          }
          periods {
            isCurrent
            endDate
          }
        }
        newsletterSettings {
          status
          subscriptions {
            name
            subscribed
          }
        }
        sessions {
          userAgent
        }
      }
    }
  }
`

const ZatUsers = ({ users, t }) => {
  return (
    <>
      {users?.map(
        ({
          id,
          email,
          name,
          activeMembership,
          newsletterSettings,
          sessions
        }) => {
          const currentPeriod = activeMembership?.periods?.find(
            period => period.isCurrent
          )
          const currentPeriodRange =
            currentPeriod && `gültig bis ${displayDate(currentPeriod.endDate)}`

          let membershipData = [
            activeMembership?.type?.name,
            currentPeriodRange
          ]
            .filter(Boolean)
            .join(' · ')

          const newsletterNames = newsletterSettings?.subscriptions
            ?.filter(subscription => subscription.subscribed)
            .map(subscription =>
              t(
                `account/newsletterSubscriptions/${subscription.name}/label`,
                undefined,
                subscription.name
              )
            )

          const newsletterTitel = ['Newsletter', newsletterSettings?.status]
            .filter(Boolean)
            .join(' · ')

          return (
            <div key={id} {...styles.item}>
              <div>
                <A href={`/users/${id}`} target='_blank'>
                  {name ? `${name} (${email})` : email}
                </A>
              </div>
              <div>
                <DT {...styles.title}>Membership</DT>
                <DD>
                  <Label>{membershipData || 'aktuell kein Abonnement'}</Label>
                </DD>
              </div>

              {newsletterSettings && (
                <div>
                  <DT {...styles.title}>{newsletterTitel}</DT>
                  {newsletterNames.length > 0 ? (
                    newsletterNames.map((newsletterName, index) => (
                      <DD key={index}>
                        <Label>{newsletterName}</Label>
                      </DD>
                    ))
                  ) : (
                    <DD>
                      <Label>keine Newsletter abonniert</Label>
                    </DD>
                  )}
                </div>
              )}
              {sessions && sessions.length > 0 && (
                <div>
                  <DT {...styles.title}>Sessions</DT>
                  {sessions.map((session, index) => (
                    <DD key={index}>
                      <Label>{session.userAgent}</Label>
                    </DD>
                  ))}
                </div>
              )}
            </div>
          )
        }
      )}
    </>
  )
}

const Zat = props => {
  const [zafClient, setZafClient] = useState(null)
  const [zafContext, setZafContext] = useState(null)
  const [zafUser, setZafUser] = useState(null)
  const [searchEmail, setSearchEmail] = useState(null)
  const [searchName, setSearchName] = useState(null)

  const { origin, app_guid } = props.router.query
  const { t } = props

  useEffect(() => {
    if (typeof window !== 'undefined' && origin && app_guid) {
      const client = new ZafClient({ origin, appGuid: app_guid })
      setZafClient(client)

      const fetchZafContext = async () => {
        const context = await client.context()
        // console.log('zaf, context', context)
        setZafContext(context)
      }
      fetchZafContext()
    }
  }, [origin, app_guid])

  useEffect(() => {
    if (zafContext) {
      const fetchZafUser = async () => {
        const user =
          (zafContext.location === 'user_sidebar' &&
            (await zafClient.get('user').then(({ user }) => user))) ||
          (zafContext.location === 'ticket_sidebar' &&
            (await zafClient
              .get('ticket')
              .then(({ ticket }) => ticket.requester))) ||
          null
        // console.log('zaf, user', user)
        setZafUser(user)
      }
      fetchZafUser()
    }
  }, [zafContext])

  useEffect(() => {
    if (zafUser) {
      const { email, name } = zafUser
      setSearchEmail(email)
      setSearchName(name)
    }
  }, [zafUser])

  if (!searchEmail && !searchName) {
    return (
      <App>
        <Body>
          <Loader loading />
        </Body>
      </App>
    )
  }

  return (
    <App>
      <Body>
        <div {...styles.hint}>
          Suche{' '}
          <A
            href={`/users?search=${encodeURI(searchEmail || searchName)}`}
            target='_blank'
          >
            E-Mail-Adresse
          </A>
          {' · '}
          <A
            href={`/users?search=${encodeURI(searchName || searchEmail)}`}
            target='_blank'
          >
            Name
          </A>
          {' · '}
          <A href={`/mailbox?search=${encodeURI(searchEmail)}`} target='_blank'>
            E-Mails
          </A>
        </div>
        <Query
          query={GET_ADMIN_USERS}
          variables={{ search: searchEmail || searchName }}
        >
          {({ loading, error, data }) => {
            const isInitialLoading = loading && !(data && data.adminUsers)
            return (
              <Loader
                loading={isInitialLoading}
                error={error}
                render={() => {
                  let resultUsers = data.adminUsers?.items
                  let searchInfo

                  const exactMatch = data.adminUsers?.items?.filter(
                    user => user.email === zafUser.email
                  )

                  if (exactMatch?.length > 0) {
                    resultUsers = exactMatch
                  } else {
                    searchInfo =
                      resultUsers?.length > 0
                        ? 'Keine exakte Übereinstimmung, folgende User haben eine ähnliche E-Mail-Adresse:'
                        : 'Keine passenden User gefunden'
                  }

                  return (
                    <>
                      <div>
                        {searchInfo && <div {...styles.hint}>{searchInfo}</div>}
                        <ZatUsers users={resultUsers} t={t} />
                      </div>
                    </>
                  )
                }}
              />
            )
          }}
        </Query>
      </Body>
    </App>
  )
}

export default compose(
  enforceAuthorization(['supporter']),
  withRouter,
  withT
)(Zat)
