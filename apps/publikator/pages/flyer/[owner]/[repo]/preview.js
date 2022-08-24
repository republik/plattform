import { withRouter } from 'next/router'
import { flyerSchema, SlateRender } from '@project-r/styleguide'
import { cleanupTree } from '@project-r/styleguide/editor'
import Loader from '../../../../components/Loader'
import * as fragments from '../../../../lib/graphql/fragments'
import initLocalStore from '../../../../lib/utils/localStorage'
import withT from '../../../../lib/withT'
import { getCurrentValue } from '../../../../components/Edit'
import compose from 'lodash/flowRight'
import { getRepoIdFromQuery } from '../../../../lib/repoIdHelper'
import { useEffect, useState } from 'react'
import { withDefaultSSR } from '../../../../lib/apollo/helpers'
import { withCommitData } from '../../../../components/Edit/enhancers'

const PreviewPage = ({ router: { query }, data }) => {
  const { commitId, commitOnly } = query
  const repoId = getRepoIdFromQuery(query)
  const [store, setStore] = useState()

  useEffect(() => {
    if (repoId && commitId && commitOnly !== 'true') {
      const storeKey = [repoId, commitId].join('/')
      setStore(initLocalStore(storeKey))
    }
  }, [repoId, commitId])

  return (
    <Loader
      loading={!data || (!commitOnly && !store) || data?.loading}
      error={data?.error}
      render={() => {
        const value = JSON.parse(JSON.stringify(getCurrentValue(store, data)))
        if (!value) return null
        return (
          <SlateRender value={cleanupTree(value, true)} schema={flyerSchema} />
        )
      }}
    />
  )
}

export default withDefaultSSR(
  compose(withRouter, withT, withCommitData)(PreviewPage),
)
