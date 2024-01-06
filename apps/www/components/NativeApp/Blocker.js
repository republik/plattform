import { Button, HR, Interaction } from '@project-r/styleguide'
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

export const Blocker = ({ message, children }) => {
  const { me } = useMe()
  const { asPath } = useRouter()
  const { inNativeApp } = useInNativeApp()
  const [getBlockerToken] = useLazyQuery(query, { fetchPolicy: 'network-only' })
  const [href, setHref] = useState(new URL(asPath, GOTO_BASE_URL).toString())

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
    if (inNativeApp && me) {
      handleBlockerToken()
    }
  }, [inNativeApp, me])

  if (inNativeApp) {
    return (
      <Box style={{ padding: 14, marginBottom: 20 }}>
        {message}
        {!!message && <HR />}
        <Button
          primary
          href={href}
          target='_blank'
          onClick={() => handleBlockerToken()}
        >
          Im Browser fortfahren
        </Button>
        <HR />
        <Interaction.P style={{ overflowWrap: 'break-word' }}>
          href: {href}
        </Interaction.P>
      </Box>
    )
  }

  return children
}

Blocker.propTypes = {
  message: PropTypes.node,
  children: PropTypes.node,
}

export default Blocker
