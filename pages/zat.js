import React, { useState, useEffect } from 'react'
import { Query, compose } from 'react-apollo'
import { withRouter } from 'next/router'
import gql from 'graphql-tag'

import { enforceAuthorization } from '../components/Auth/withAuthorization'
import App from '../components/App'
import { Body } from '../components/Layout'

import ZafClient from '../lib/zat/client'

export const GET_ADMIN_USERS = gql`
  query zatAdminUsers($search: String!) {
    adminUsers(search: $search, limit: 10) {
      count
      items {
        id
        email
        name
      }
    }
  }
`

const Zat = props => {
  const { origin, app_guid } = props.router.query

  const [zafClient, setZafClient] = useState(null)
  const [zafContext, setZafContext] = useState(null)
  const [zafUser, setZafUser] = useState(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && origin && app_guid) {
      const client = new ZafClient({ origin, appGuid: app_guid })
      setZafClient(client)

      const fetchZafContext = async () => {
        const context = await client.context()
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

        setZafUser(user)
      }
      fetchZafUser()
    }
  }, [zafContext])

  if (!zafUser) {
    return <p>Lade … (Entität)</p>
  }

  return (
    <App>
      <Body>
        <Query query={GET_ADMIN_USERS} variables={{ search: zafUser.email }}>
          {({ data }) => {
            if (!data) {
              return <p>Lade … (Admin-Tool)</p>
            }

            return (
              <>
                {data.adminUsers?.items?.map(({ id, email, name }) => {
                  return (
                    <div key={id}>
                      <a href={`/users/${id}`} target='_blank'>
                        {name} {email}
                      </a>
                    </div>
                  )
                })}
              </>
            )
          }}
        </Query>
      </Body>
    </App>
  )
}

export default compose(enforceAuthorization(['supporter']), withRouter)(Zat)
