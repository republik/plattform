import { gql, useQuery } from '@apollo/client'
import { useInNativeApp } from 'lib/withInNativeApp'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Button } from '@project-r/styleguide'

import { GOTO_BASE_URL } from '../../lib/constants'
import { BaseRouter } from 'next/dist/shared/lib/router/router'

const query = gql`
  query AngeboteLinkToken {
    me {
      id
      submitPledgeToken: accessToken(scope: SUBMIT_PLEDGE)
    }
  }
`

type GotoLinkBlocker = {
  message?: React.ReactNode
  children: React.ReactNode
  appendSubmitPledgeToken?: boolean
  adhereIOSGuidlines?: boolean
}

const getUrl = (asPath: BaseRouter['asPath']) => new URL(asPath, GOTO_BASE_URL)

/**
 * `GotoLinkBlocker` is a React Component with will render a "goto"-link instead of children
 * if run in native app.
 *
 * ```
 * <GotoLinkBlocker message={<p>Unable to show in app</p>}>
 *   <p>Something invisible in app.</p>
 * </GotoLinkBlocker>
 * ```
 *
 * If `appendSubmitPledgeToken` prop is set, it will fetch and append an access
 * token with SUBMIT_PLEDGE scope.
 *
 * ```
 * <GotoLinkBlocker message={<p>Unable to show in app</p>} appendSubmitPledgeToken>
 *   <p>Something invisible in app.</p>
 * </GotoLinkBlocker>
 * ```
 *
 */
const GotoLinkBlocker = (props: GotoLinkBlocker) => {
  const {
    message = null,
    children,
    appendSubmitPledgeToken = false,
    adhereIOSGuidlines = true,
  } = props

  const { asPath } = useRouter()
  const [href, setHref] = useState(getUrl(asPath).toString())
  const { inNativeApp, inNativeIOSApp } = useInNativeApp()
  const { data } = useQuery(query, {
    skip: !inNativeApp || !appendSubmitPledgeToken,
  })

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

  useEffect(() => {
    if (data?.me?.submitPledgeToken) {
      const token = data.me.submitPledgeToken

      if (token) {
        const url = getUrl(asPath)

        url.searchParams.set('token', token)

        setHref(url.toString())
      }
    }
  }, [data])

  if (inNativeApp) {
    return (
      <>
        {message}
        {!!message && !hideLink && <br />}
        {!hideLink && (
          <Button primary block href={href} target='_blank'>
            Im Browser fortfahren
          </Button>
        )}
      </>
    )
  }

  return children
}

export default GotoLinkBlocker
