import compose from 'lodash/flowRight'
import { withRouter } from 'next/router'

import withAuthorization from '../../../../components/Auth/withAuthorization'

import Frame from '../../../../components/Frame'
import RepoNav from '../../../../components/Repo/Nav'
import Publication from '../../../../components/Publication'

import withT from '../../../../lib/withT'
import { getRepoIdFromQuery } from '../../../../lib/repoIdHelper'
import { withDefaultSSR } from '../../../../lib/apollo/helpers'

const Page = ({ router, t }) => {
  const repoId = getRepoIdFromQuery(router.query)
  const { commitId } = router.query
  return (
    <Frame>
      <Frame.Header>
        <Frame.Header.Section align='left'>
          <Frame.Nav>
            <RepoNav route='repo/publish' prefix='document' />
          </Frame.Nav>
        </Frame.Header.Section>
        <Frame.Header.Section align='right'>
          <Frame.Me />
        </Frame.Header.Section>
      </Frame.Header>
      <Frame.Body raw={true}>
        <Publication repoId={repoId} commitId={commitId} t={t} />
      </Frame.Body>
    </Frame>
  )
}

export default withDefaultSSR(
  compose(withAuthorization(['editor']), withT, withRouter)(Page),
)
