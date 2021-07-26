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
import { css } from 'glamor'

const styles = {
  item: css({
    borderTop: '1px solid #DDD',
    marginTop: '10px',
    paddingTop: '10px'
  }),
  spacing: css({
    marginTop: '10px'
  }),
  title: css({
    ...fontStyles.sansSerifMedium14
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
            beginDate
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
          expiresAt
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
          let currentPeriodRange
          if (currentPeriod) {
            currentPeriodRange = `${displayDate(
              currentPeriod?.beginDate
            )} - ${displayDate(currentPeriod?.endDate)}`
          }

          let membershipData = [
            activeMembership?.type?.name,
            currentPeriodRange
          ]
            .filter(Boolean)
            .join(' · ')

          const newsletterNames = newsletterSettings?.subscriptions
            ?.filter(subscription => subscription.subscribed)
            .map(subscription =>
              subscription.name
                ? t(
                    `account/newsletterSubscriptions/${subscription.name}/label`
                  )
                : null
            )

          const newsletterTitel = ['Newsletter', newsletterSettings?.status]
            .filter(Boolean)
            .join(' · ')

          return (
            <>
              <div key={id} {...styles.item}>
                <A href={`/users/${id}`} target='_blank'>
                  {name ? `${name} (${email})` : email}
                </A>
              </div>
              <div {...styles.spacing}>
                <DT {...styles.title}>Membership</DT>
                {membershipData?.length > 0 ? (
                  <DD>
                    <Label>{membershipData}</Label>
                  </DD>
                ) : (
                  <DD>
                    <Label>aktuell kein Abonnement</Label>
                  </DD>
                )}
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
            </>
          )
        }
      )}
    </>
  )
}

const Zat = props => {
  const { origin, app_guid } = props.router.query
  const { t } = props

  const [zafClient, setZafClient] = useState(null)
  const [zafContext, setZafContext] = useState(null)
  const [zafUser, setZafUser] = useState(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && origin && app_guid) {
      const client = new ZafClient({ origin, appGuid: app_guid })
      setZafClient(client)

      const fetchZafContext = async () => {
        const context = await client.context()
        console.log('zaf, context', context)
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
        console.log('zaf, user', user)
        setZafUser(user)
      }
      fetchZafUser()
    }
  }, [zafContext])

  if (!zafUser) {
    return (
      <App>
        <Body>
          <p>Lade … (Entität)</p>
        </Body>
      </App>
    )
  }

  return (
    <App>
      <Body>
        {
          <pre>
            context.location: {zafContext.location}
            <br />
            user.id {zafUser.id}
          </pre>
        }
        <Query query={GET_ADMIN_USERS} variables={{ search: zafUser.email }}>
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
                    <div>
                      <div>
                        {searchInfo && (
                          <span>
                            <Label>{searchInfo}</Label>
                          </span>
                        )}
                        <ZatUsers
                          key={`${zafUser.id}-${zafUser.email}`}
                          users={resultUsers}
                          t={t}
                        />
                      </div>
                      <div {...styles.item}>
                        <A
                          href={`/users?search=${zafUser.email}`}
                          target='_blank'
                        >
                          Zur Suche im Admin-Tool
                        </A>
                      </div>
                    </div>
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
