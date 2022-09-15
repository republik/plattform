import { withRouter } from 'next/router'
import {
  flyerSchema,
  SlateRender,
  ColorContextProvider,
  VariableContext,
} from '@project-r/styleguide'
import { cleanupTree } from '@project-r/styleguide/editor'
import Loader from '../../../../components/Loader'
import initLocalStore from '../../../../lib/utils/localStorage'
import withT from '../../../../lib/withT'
import { getCurrentContent } from '../../../../components/Edit'
import compose from 'lodash/flowRight'
import { getRepoIdFromQuery } from '../../../../lib/repoIdHelper'
import { useEffect, useState } from 'react'
import { withDefaultSSR } from '../../../../lib/apollo/helpers'
import { withCommitData } from '../../../../components/Edit/enhancers'

const PreviewPage = ({ router: { query }, data, t }) => {
  const { commitId, darkmode, hasAccess, commitOnly } = query
  const repoId = getRepoIdFromQuery(query)
  const [store, setStore] = useState()

  useEffect(() => {
    if (repoId && commitId && commitOnly !== 'true') {
      const storeKey = [repoId, commitId].join('/')
      setStore(initLocalStore(storeKey))
    }
  }, [repoId, commitId])

  const variableContextValue =
    hasAccess === 'true'
      ? {
          firstName: 'Lois',
          lastName: 'Lane',
          hasAccess,
        }
      : {}

  return (
    <Loader
      loading={!data || (!commitOnly && !store) || data?.loading}
      error={data?.error}
      render={() => {
        const content = getCurrentContent(store, data, t)
        if (!content) return null
        return (
          <ColorContextProvider
            colorSchemeKey={darkmode === 'true' ? 'dark' : 'light'}
          >
            <VariableContext.Provider value={variableContextValue}>
              <SlateRender
                value={cleanupTree(content.children, true)}
                schema={flyerSchema}
              />
            </VariableContext.Provider>
          </ColorContextProvider>
        )
      }}
    />
  )
}

export default withDefaultSSR(
  compose(withRouter, withT, withCommitData)(PreviewPage),
)
