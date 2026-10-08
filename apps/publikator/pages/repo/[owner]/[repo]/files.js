import compose from 'lodash/flowRight'

import { withRouter } from 'next/router'
import withAuthorization from '../../../../components/Auth/withAuthorization'

import Files from '../../../../components/Files'

import { withDefaultSSR } from '../../../../lib/apollo/helpers'
import withT from '../../../../lib/withT'

export default withDefaultSSR(
  compose(withAuthorization, withRouter, withT)(Files),
)
