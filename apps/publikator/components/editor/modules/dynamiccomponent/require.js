import { createRequire } from '@project-r/styleguide'

/*
 * import all react-apollo and graphql-tag functions
 * for dynamic components
 */

/* eslint-disable */
import * as reactApollo from 'react-apollo'
import * as graphqlTag from 'graphql-tag'
/* eslint-enable */

export default createRequire().alias({
  'react-apollo': reactApollo,
  'graphql-tag': graphqlTag,
})
