import React from 'react'
import gql from 'graphql-tag'
import { Label, A } from '@project-r/styleguide'

import withT from '../../lib/withT'

import { displayDate, DT, DD } from '../Display/utils'

import { styles } from './utils'

export const fragments = gql`
  fragment UsersFragment on Users {
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
`

const Users = ({ email, users, t }) => {
  const matchingUser = users?.find(u => u.email === email)
  const hasMatchingUsers = !!matchingUser

  return (
    <>
      {!hasMatchingUsers && (
        <div {...styles.hint}>
          Keinen User gefunden.{' '}
          {!!users?.length && <>User mit einer ähnlichen E-Mail-Adresse:</>}
        </div>
      )}
      {((hasMatchingUsers && [matchingUser]) || users)?.map(
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
              {/* Name, email address */}
              <div>
                <A href={`/users/${id}`} target='_blank'>
                  {name || email}
                </A>
              </div>
              {!matchingUser?.length && !!name && <div>{email}</div>}

              {/* Memberships */}
              <div>
                <DT {...styles.title}>Membership</DT>
                <DD>
                  <Label>{membershipData || 'aktuell kein Abonnement'}</Label>
                </DD>
              </div>

              {/* Newsletter */}
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

              {/* Sessions */}
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

export default withT(Users)
