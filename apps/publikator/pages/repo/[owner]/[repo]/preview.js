import { useMemo } from 'react'
import { withRouter } from 'next/router'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import { ColorContextProvider, VariableContext } from '@project-r/styleguide'
import { renderMdast } from 'mdast-react-render'

import Loader from '../../../../components/Loader'
import Frame from '../../../../components/Frame'
import { getSchema } from '../../../../components/Templates'

import * as fragments from '../../../../lib/graphql/fragments'
import initLocalStore from '../../../../lib/utils/localStorage'
import withT from '../../../../lib/withT'
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

const PreviewPage = ({ t, router, data = {} }) => {
  const { loading, error, repo: { commit: { document } = {} } = {} } = data
  const repoId = getRepoIdFromQuery(router.query)
  const { commitId, darkmode, hasAccess } = router.query

  const storeKey = [repoId, commitId].join('/')
  const store = initLocalStore(storeKey)
  let localState = store.get('editorState')

  const template = localState?.meta?.template || document?.meta?.template

  const schema = useMemo(() => {
    if (!template) {
      return
    }
    return getSchema(template)
  }, [template])

  const notFound = !schema ? t('publish/preview/404') : undefined

  const variableContextValue =
    hasAccess === 'true'
      ? {
          firstName: 'Lois',
          lastName: 'Lane',
          hasAccess,
        }
      : {}

  return (
    <Frame.Body raw>
      <ColorContextProvider
        colorSchemeKey={darkmode === 'true' ? 'dark' : 'light'}
      >
        <VariableContext.Provider value={variableContextValue}>
          <Loader
            loading={loading}
            error={error || notFound}
            render={() => {
              if (!schema) {
                return null
              }
              return (
                <>
                  {renderMdast(
                    localState
                      ? {
                          ...localState,
                          format: localState.meta?.format,
                          section: localState.meta?.section,
                          series: localState.meta?.series,
                          repoId,
                        }
                      : {
                          ...document.content,
                          format: document.meta.format,
                          section: document.meta.section,
                          series: document.meta.series,
                          repoId,
                        },
                    schema,
                  )}
                </>
              )
            }}
          />
        </VariableContext.Provider>
      </ColorContextProvider>
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
        repoId: getRepoIdFromQuery(router.query),
        commitId: router.query.commitId,
      },
    }),
  }),
)(PreviewPage)
