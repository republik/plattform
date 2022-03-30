import { Fragment } from 'react';
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { withRouter } from 'next/router'

import withT from '../../lib/withT'
import withInNativeApp from '../../lib/withInNativeApp'
import { PUBLIC_BASE_URL } from '../../lib/constants'

import Loader from '../Loader'
import Me from '../Auth/Me'
import Meta from '../Frame/Meta'

import ErrorFrame from './Frame'

import { Interaction } from '@project-r/styleguide'

const getRedirect = gql`
  query getRedirect($path: String!) {
    redirection(path: $path) {
      target
      status
    }
  }
`

const StatusError = ({ statusCode, t, loading, children }) => (
  <Loader
    loading={loading}
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

export default compose(
  withT,
  withInNativeApp,
  withRouter,
  graphql(getRedirect, {
    skip: (props) => props.statusCode !== 404 || !props.router.asPath,
    options: ({ router: { asPath } }) => ({
      variables: {
        path: asPath.split('#')[0],
      },
    }),
    props: ({
      data,
      ownProps: {
        serverContext,
        statusCode,
        router,
        inNativeApp,
        inNativeIOSApp,
      },
    }) => {
      const redirection = !data.error && !data.loading && data.redirection

      let loading = data.loading

      if (redirection) {
        const { target, status } = redirection
        const targetIsExternal =
          target.startsWith('http') && !target.startsWith(PUBLIC_BASE_URL)
        const restrictedIOSPath =
          inNativeIOSApp && target.match(/^\/angebote(\?|$)/)

        loading = true

        if (serverContext) {
          if (!inNativeApp || (!targetIsExternal && !restrictedIOSPath)) {
            serverContext.res.redirect(status || 302, target)
            throw new Error('redirect')
          }
        } else if (process.browser) {
          // SSR does two two-passes: data (with serverContext) & render (without)
          let clientTarget = target
          let afterRouting
          if (inNativeApp && (targetIsExternal || restrictedIOSPath)) {
            clientTarget = '/feed'
            afterRouting = () => {
              window.location = target
            }
          }
          if (status === 301) {
            router.replace(clientTarget).then(afterRouting)
          } else {
            router.push(clientTarget).then(afterRouting)
          }
        }
      } else {
        if (serverContext) {
          serverContext.res.statusCode = statusCode
        }
      }

      return {
        loading,
      }
    },
  }),
)(StatusError)
