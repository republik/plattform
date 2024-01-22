import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

import withInNativeApp from '../../lib/withInNativeApp'
import Link from 'next/link'

const tokenQuery = gql`
  query LinkTokenPackage {
    me {
      id
      submitPledge: accessToken(scope: SUBMIT_PLEDGE)
    }
  }
`

const TokenPackageLink = compose(
  withInNativeApp,
  graphql(tokenQuery, {
    skip: (props) => !props.inNativeApp,
    props: ({ data }) => ({
      loading: data.loading,
      submitPledge: data.me?.submitPledge,
    }),
  }),
)(
  ({
    loading,
    submitPledge,
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
    if (submitPledge) {
      query.token = submitPledge
    }
    return (
      <Link
        href={{
          pathname: '/angebote',
          query,
        }}
        {...props}
        legacyBehavior
      >
        {children}
      </Link>
    )
  },
)

export default TokenPackageLink
