import { gql } from '@apollo/client'
import { graphql } from '@apollo/client/react/hoc'

import { Editorial, Interaction } from '@project-r/styleguide'
import compose from 'lodash/flowRight'
import { withRouter } from 'next/router'
import { Fragment, useEffect } from 'react'
import { PUBLIC_BASE_URL } from '../../lib/constants'
import withInNativeApp from '../../lib/withInNativeApp'

import withT from '../../lib/withT'
import Me from '../Auth/Me'
import Meta from '../Frame/Meta'

import Loader from '../Loader'

import ErrorFrame from './Frame'

export const isExternal = (target) =>
  !target.startsWith('/') &&
  !target.startsWith(PUBLIC_BASE_URL) &&
  !target.startsWith(PUBLIC_BASE_URL.replace('https://www.', 'https://'))

const getRedirect = gql`
  query getRedirect($path: String!) {
    redirection(path: $path) {
      id
      target
      status
    }
  }
`

const getURLLabel = (url) => {
  try {
    return new URL(url).hostname?.replace(/^www\./, '')
  } catch (e) {
    return url?.replace(/^https?:\/\/www\./, '')
  }
}
const appendQueryString = (target, queryString) => {
  return `${target}${
    queryString ? `${target.includes('?') ? '&' : '?'}${queryString}` : ''
  }`
}

const StatusError = ({
  clientRedirection,
  statusCode,
  t,
  loading,
  children,
  router,
  inNativeApp,
}) => {
  const isExternalClientRedirection =
    clientRedirection && isExternal(clientRedirection.target)
  // forward current query string
  // - this useful for utm preserving
  // - forwarding params to ultradashboard
  const queryString = router.asPath.split('?')[1]
  const clientRedirectionTarget =
    clientRedirection &&
    appendQueryString(clientRedirection.target, queryString)
  const { isReady } = router

  useEffect(() => {
    if (!clientRedirection || !isReady) {
      return
    }
    if (isExternalClientRedirection) {
      // give matomo some time to register the page view
      const timeoutId = setTimeout(() => {
        window.location = clientRedirectionTarget
        setTimeout(() => {
          if (inNativeApp) {
            // window.location will open in a browser, reset app to home page (previously was history.back(), which doesn't always work!)
            window.location.href = '/'
          } else {
            // e.g. on iOS a Apple apps link will open the App Store App, reset to a more useful page afterwards
            window.location = appendQueryString(
              clientRedirection.postExternalTarget || '/',
              queryString,
            )
          }
        }, 1000)
      }, 1000)
      return () => {
        clearTimeout(timeoutId)
      }
    } else {
      router[clientRedirection.status === 301 ? 'replace' : 'push'](
        clientRedirectionTarget,
      )
    }
  }, [
    clientRedirection,
    isReady,
    clientRedirectionTarget,
    queryString,
    isExternalClientRedirection,
    inNativeApp,
  ])

  return (
    <Loader
      loading={loading || !!clientRedirection}
      message={
        isExternalClientRedirection && (
          <div style={{ padding: 15 }}>
            {t.elements('redirection/external/message', {
              link: (
                <Editorial.A key='link' href={clientRedirectionTarget}>
                  {getURLLabel(clientRedirection.target) ||
                    t('redirection/external/genericLink')}
                </Editorial.A>
              ),
            })}
          </div>
        )
      }
      render={() => (
        <Fragment>
          <Meta data={{ title: statusCode }} />
          <ErrorFrame statusCode={statusCode}>
            {children || (
              <Interaction.P>
                {t(`error/${statusCode}`, undefined, null)}
              </Interaction.P>
            )}
            <div style={{ height: 60 }} />
            <Me />
          </ErrorFrame>
        </Fragment>
      )}
    />
  )
}

export default compose(
  withT,
  withInNativeApp,
  withRouter,
  graphql(getRedirect, {
    skip: (props) =>
      props.statusCode !== 404 ||
      !props.router.asPath ||
      props.clientRedirection,
    options: ({ router: { asPath } }) => ({
      variables: {
        path: asPath.split('#')[0],
      },
    }),
    props: ({ data, ownProps: { serverContext, statusCode, inNativeApp } }) => {
      const redirection = !data.error && !data.loading && data.redirection

      let loading = data.loading
      let clientRedirection

      if (redirection) {
        const { target, status } = redirection
        const targetIsExternal = isExternal(target)
        const restrictedAppPath =
          inNativeApp && target.match(/^\/angebote(\?|$)/)

        loading = true

        if (serverContext) {
          if (!inNativeApp || (!targetIsExternal && !restrictedAppPath)) {
            serverContext.res.redirect(status || 302, target)
            throw new Error('redirect')
          }
        } else if (
          // SSR does two two-passes: data (with serverContext) & render (without)
          process.browser
        ) {
          clientRedirection = redirection
        }
      } else {
        if (serverContext) {
          serverContext.res.statusCode = statusCode
        }
      }

      return {
        loading,
        clientRedirection,
      }
    },
  }),
)(StatusError)
