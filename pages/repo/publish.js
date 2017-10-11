import React from 'react'
import { compose } from 'redux'
import withData from '../../lib/apollo/withData'

import Frame from '../../components/Frame'
import RepoNav from '../../components/Repo/Nav'
import PublishForm from '../../components/Publication/PublishForm'

import withT from '../../lib/withT'

const Page = ({ url, data, t }) => {
  const { repoId, commitId } = url.query

  return (
    <Frame url={url} nav={<RepoNav route='repo/publish' url={url} />}>
      <h1>{t('publish/title')}</h1>
      <PublishForm repoId={repoId} commitId={commitId} t={t} />
    </Frame>
  )
}

export default compose(
  withData,
  withT
)(Page)
