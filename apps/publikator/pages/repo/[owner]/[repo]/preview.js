import { useMemo } from 'react'
import { withRouter } from 'next/router'
import compose from 'lodash/flowRight'
import { ColorContextProvider, VariableContext } from '@project-r/styleguide'
import { renderMdast } from '@republik/mdast-react-render'

import Loader from '../../../../components/Loader'
import Frame from '../../../../components/Frame'
import { getSchema } from '../../../../components/Templates'

import initLocalStore from '../../../../lib/utils/localStorage'
import withT from '../../../../lib/withT'
import { getRepoIdFromQuery } from '../../../../lib/repoIdHelper'
import { withDefaultSSR } from '../../../../lib/apollo/helpers'
import { withCommitData } from '../../../../components/Edit/enhancers'
import { ThemeProvider } from '../../../../components/theme-provider'
import Layout from '../../../../components/Layout'
const PreviewPage = ({ t, router, data = {} }) => {
  const { loading, error, repo: { commit: { document } = {} } = {} } = data
  const repoId = getRepoIdFromQuery(router.query)
  const { commitId, darkmode, hasAccess, commitOnly } = router.query

  const storeKey = [repoId, commitId].join('/')
  const store = initLocalStore(storeKey)
  const localState = commitOnly !== 'true' && store.get('editorState')

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
    <Layout>
      <ColorContextProvider
        colorSchemeKey={darkmode === 'true' ? 'dark' : 'light'}
      >
        <ThemeProvider forcedTheme={darkmode === 'true' ? 'dark' : 'light'}>
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
        </ThemeProvider>
      </ColorContextProvider>
    </Layout>
  )
}

export default withDefaultSSR(
  compose(withRouter, withT, withCommitData)(PreviewPage),
)
