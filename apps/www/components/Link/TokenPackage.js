import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

import withInNativeApp from '../../lib/withInNativeApp'
import Link from 'next/link'

const tokenQuery = gql`
  query accessTokenCustomPledge {
    me {
      id
      accessToken(scope: CUSTOM_PLEDGE)
    }
  }
`

const TokenPackageLink = compose(
  withInNativeApp,
  graphql(tokenQuery, {
    skip: (props) => !props.inNativeApp,
    props: ({ data }) => ({
      loading: data.loading,
      accessToken: data.me && data.me.accessToken,
    }),
  }),
)(
  ({
    loading,
    accessToken,
    children,
    params,
    inNativeApp,
    inNativeIOSApp,
    inIOS,
    ...props
  }) => {
    if (loading) {
      return '...'
    }
    const query = { ...params }
    if (accessToken) {
      query.token = accessToken
    }
    return (
      <Link
        href={{
          pathname: '/angebote',
          query,
        }}
        {...props}
        legacyBehavior>
        {children}
      </Link>
    );
  },
)

export default TokenPackageLink
