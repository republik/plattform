'use client'

import { gql } from '@apollo/client'
import { Query } from '@apollo/client/react/components'
import { Loader } from '@project-r/styleguide'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import App from '@/components/App'
import { Body } from '@/components/Layout'
import Info from '@/components/Zat/Info'
import Mails, { fragments as MailsFragments } from '@/components/Zat/Mails'
import Users, { fragments as UsersFragments } from '@/components/Zat/Users'

import ZafClient from '@/lib/zat/client'

const GET_ZAT_SEARCH = gql`
  query zatSearch($search: String!) {
    adminUsers(search: $search, limit: 5) {
      ...UsersFragment
    }
    mailbox(first: 5, filters: { email: $search }) {
      ...MailsFragment
    }
  }

  ${UsersFragments}
  ${MailsFragments}
`

const Zat = () => {
  const searchParams = useSearchParams()
  const [zafClient, setZafClient] = useState(null)
  const [zafContext, setZafContext] = useState(null)
  const [zafUser, setZafUser] = useState(null)
  const [searchEmail, setSearchEmail] = useState(null)
  const [searchName, setSearchName] = useState(null)

  const origin = searchParams.get('origin')
  const app_guid = searchParams.get('app_guid')
  const email = searchParams.get('email')
  const name = searchParams.get('name')

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
    if (email) {
      setSearchEmail(email)
    }
  }, [email])

  useEffect(() => {
    if (name) {
      setSearchName(name)
    }
  }, [name])

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
  }, [zafContext, zafClient])

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
        <Info email={searchEmail} name={searchName} />
        <Query
          query={GET_ZAT_SEARCH}
          variables={{ search: searchEmail || searchName }}
        >
          {({ loading, error, data }) => {
            const isInitialLoading = loading && !(data && data.adminUsers)
            return (
              <Loader
                loading={isInitialLoading}
                error={error}
                render={() => (
                  <>
                    <Users
                      email={searchEmail}
                      name={searchName}
                      users={data.adminUsers?.items}
                    />
                    <Mails mails={data.mailbox?.nodes} />
                  </>
                )}
              />
            )
          }}
        </Query>
      </Body>
    </App>
  )
}

export default Zat
