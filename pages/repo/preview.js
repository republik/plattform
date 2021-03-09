import React, { useRef } from 'react'
import { withRouter } from 'next/router'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import { ColorContextProvider } from '@project-r/styleguide'
import { renderMdast } from 'mdast-react-render'

import Loader from '../../components/Loader'
import Frame from '../../components/Frame'
import { getSchema } from '../../components/Templates'

import * as fragments from '../../lib/graphql/fragments'
import initLocalStore from '../../lib/utils/localStorage'
import withT from '../../lib/withT'

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

const PreviewPage = ({ dark, router, data = {} }) => {
  const {
    loading,
    error,
    repo: {
      commit: { document }
    }
  } = data
  const { repoId, commitId } = router.query
  const storeKey = [repoId, commitId].join('/')
  const store = initLocalStore(storeKey)
  let localState = store.get('editorState')

  const schema = getSchema(document.meta.template)

  return (
    <Frame.Body raw>
      <Loader
        loading={loading}
        error={error}
        render={() => (
          <ColorContextProvider colorSchemeKey={dark ? 'dark' : 'light'}>
            {renderMdast(
              {
                ...(localState ? localState : document.content),
                format: document.meta.format,
                section: document.meta.section,
                series: document.meta.series,
                repoId: document.repoId
              },
              schema
            )}
          </ColorContextProvider>
        )}
      />
    </Frame.Body>
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
        repoId: router.query.repoId,
        commitId: router.query.commitId
      }
    })
  })
)(PreviewPage)
