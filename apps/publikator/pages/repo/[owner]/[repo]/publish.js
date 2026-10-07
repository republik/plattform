import compose from 'lodash/flowRight'
import { withRouter } from 'next/router'

import withAuthorization from '../../../../components/Auth/withAuthorization'

import Publication from '../../../../components/Publication'
import { withDefaultSSR } from '../../../../lib/apollo/helpers'
import { getRepoIdFromQuery } from '../../../../lib/repoIdHelper'

import withT from '../../../../lib/withT'

const Page = ({ router, t }) => {
  const repoId = getRepoIdFromQuery(router.query)
  const { commitId } = router.query
  return <Publication repoId={repoId} commitId={commitId} t={t} />
}

export default withDefaultSSR(
  compose(withAuthorization, withT, withRouter)(Page),
)
