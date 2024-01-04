import { Button, HR, Interaction } from '@project-r/styleguide'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

import { GOTO_BASE_URL } from '../../lib/constants'
import { useInNativeApp } from '../../lib/withInNativeApp'
import Box from '../Frame/Box'
import { useMe } from '../../../admin/lib/useMe'
import { useEffect, useState } from 'react'
import { gql, useLazyQuery } from '@apollo/client'

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
  const [getBlockerToken] = useLazyQuery(query)
  const [href, setHref] = useState(new URL(asPath, GOTO_BASE_URL).toString())

  useEffect(() => {
    if (inNativeApp && me) {
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
    }
  }, [inNativeApp, me])

  if (inNativeApp) {
    return (
      <Box style={{ padding: 14, marginBottom: 20 }}>
        {message}
        {!!message && <HR />}
        <Button href={href} primary target='_blank'>
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
  message: PropTypes.element,
  children: PropTypes.element.isRequired,
}

export default Blocker
