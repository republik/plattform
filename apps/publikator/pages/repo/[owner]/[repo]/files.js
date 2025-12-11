import compose from 'lodash/flowRight'

import { withDefaultSSR } from '../../../../lib/apollo/helpers'
import withAuthorization from '../../../../components/Auth/withAuthorization'

import Files from '../../../../components/Files'

import { withRouter } from 'next/router'
import withT from '../../../../lib/withT'

export default withDefaultSSR(
  compose(withAuthorization(['editor']), withRouter, withT)(Files),
)
