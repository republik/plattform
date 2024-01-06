import { Button } from '@project-r/styleguide'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

import { GOTO_BASE_URL } from '../../lib/constants'
import { useInNativeApp } from '../../lib/withInNativeApp'
import Box from '../Frame/Box'
import { useEffect, useState } from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import { useMe } from '../../lib/context/MeContext'

const query = gql`
  query NativeAppBlockerToken {
    me {
      id
      token: accessToken(scope: AUTHORIZE_SESSION_GOTO)
    }
  }
`

export const Blocker = ({ message, adhereIOSGuidlines = true, children }) => {
  const { me } = useMe()
  const { asPath } = useRouter()
  const { inNativeApp, inNativeIOSApp } = useInNativeApp()
  const [getBlockerToken] = useLazyQuery(query, { fetchPolicy: 'network-only' })
  const [href, setHref] = useState(new URL(asPath, GOTO_BASE_URL).toString())

  /**
   * Apps in Apple eco-system may not offer links to external websites for payment, unless
   * it is a "reader" app and an "External Link Account Entitlement" was requested and
   * approved. (January 2024)
   *
   * To adhere to guidlines, link to external webseite is hidden by default.
   *
   * @see https://developer.apple.com/app-store/review/guidelines/
   * @see https://developer.apple.com/support/reader-apps/
   */
  const hideLink = adhereIOSGuidlines && inNativeIOSApp

  const handleBlockerToken = () =>
    getBlockerToken()
      .then(({ data }) => {
        const token = data?.me?.token

        if (token) {
          const url = new URL(asPath, GOTO_BASE_URL)

          url.searchParams.set('_goto_token', token)

          setHref(url.toString())
        }
      })
      .catch((e) => console.warn('query NativeAppBlockerToken failed', e))

  useEffect(() => {
    if (inNativeApp && !hideLink && me) {
      handleBlockerToken()
    }
  }, [inNativeApp, hideLink, me])

  if (inNativeApp) {
    return (
      <Box style={{ padding: 14, marginBottom: 20 }}>
        {message}
        {!!message && !hideLink && <br />}
        {!hideLink && (
          <Button
            primary
            href={href}
            target='_blank'
            onClick={() => handleBlockerToken()}
          >
            Im Browser fortfahren
          </Button>
        )}
      </Box>
    )
  }

  return children
}

Blocker.propTypes = {
  message: PropTypes.node,
  adhereIOSGuidlines: PropTypes.bool,
  children: PropTypes.node,
}

export default Blocker
