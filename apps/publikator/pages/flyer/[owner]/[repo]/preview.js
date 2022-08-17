import { withRouter } from 'next/router'
import { flyerSchema, SlateRender } from '@project-r/styleguide'
import Loader from '../../../../components/Loader'
import * as fragments from '../../../../lib/graphql/fragments'
import initLocalStore from '../../../../lib/utils/localStorage'
import withT from '../../../../lib/withT'
import { getCurrentValue } from '../../../../components/Edit'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { getRepoIdFromQuery } from '../../../../lib/repoIdHelper'

const getCommitById = gql`
  query getCommitById($repoId: ID!, $commitId: ID!) {
    repo(id: $repoId) {
      ...EditPageRepo
      commit(id: $commitId) {
        ...CommitWithDocument
      }
    }
  }
  ${fragments.EditPageRepo}
  ${fragments.CommitWithDocument}
`

const PreviewPage = ({ router: { query }, data = {} }) => {
  const { loading, error } = data
  const { commitId } = query
  const repoId = getRepoIdFromQuery(query)

  const storeKey = [repoId, commitId].join('/')
  const store = initLocalStore(storeKey)

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const value = getCurrentValue(store, data)
        return <SlateRender value={value} schema={flyerSchema} />
      }}
    />
  )
}

export default compose(
  withRouter,
  withT,
  graphql(getCommitById, {
    skip: ({ router }) =>
      router.query.commitId === 'new' || !router.query.commitId,
    options: ({ router }) => ({
      variables: {
        repoId: getRepoIdFromQuery(router.query),
        commitId: router.query.commitId,
      },
    }),
  }),
)(PreviewPage)
